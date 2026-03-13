# Push Provider Design

**Date:** 2026-03-13

## Goal

Add a global OneSignal integration layer that:
- initializes the Web SDK once for the whole app;
- listens for notification click events;
- extracts `type` and `entityId` from the notification payload;
- opens a global modal only when both fields are present;
- keeps the current `/profile` page as a diagnostics screen instead of the push entry point.

## Context

The current implementation in [src/shared/lib/push/onesignal.ts](/D:/src/horsh/horsch-pwa/src/shared/lib/push/onesignal.ts) already initializes OneSignal and exposes helper actions for linking a browser and requesting permission. Push-click handling is local to `/profile` through query params, which does not scale to the rest of the app.

The next step is to move click handling into a global provider so push behavior is available regardless of the currently opened route.

## Requirements

### Functional

- OneSignal SDK must initialize once at app startup when `VITE_ONESIGNAL_APP_ID` is configured.
- A global click listener must read `event.notification.additionalData`.
- The app must open a modal only when payload contains both:
  - `type`
  - `entityId`
- The modal must show those two values exactly as received.
- The modal must be globally available and not tied to `/profile`.
- `/profile` should continue to support manual push setup and diagnostics.

### Behavioral

- If OneSignal is not configured, the provider must stay inert.
- If payload is missing one or both required fields, no modal should open.
- If browser notification permission is already granted, provider should finish SDK setup without waiting for a page-specific user action.
- If permission is not yet granted, provider may initialize listeners but must not rely on an automatic native permission prompt being allowed by the browser.

## Approaches Considered

### 1. Query params only

Use `url`/`web_url` and continue reading payload from the route.

Rejected because this keeps push handling page-scoped and duplicates state into navigation.

### 2. Global provider with click listener

Create an app-level provider that subscribes to OneSignal events and manages modal state.

Selected because it centralizes push behavior, supports future navigation to domain pages, and removes push-specific logic from route components.

### 3. Hybrid provider plus query fallback

Use provider for click events but keep URL fallback for resilience.

Deferred because it adds complexity before a real deep-link target exists.

## Architecture

### Provider boundary

Create a new app provider, tentatively `PushProvider`, mounted in [src/app/index.tsx](/D:/src/horsh/horsch-pwa/src/app/index.tsx) inside `BrowserRouter` so it can later navigate to app routes if needed.

Responsibilities:
- initialize OneSignal through the existing push module;
- register/unregister notification click listeners;
- own ephemeral UI state for the currently opened push payload;
- render a global `antd` modal.

### Push module changes

Extend [src/shared/lib/push/onesignal.ts](/D:/src/horsh/horsch-pwa/src/shared/lib/push/onesignal.ts) with small, focused helpers:
- parse payload from `additionalData`;
- validate that payload contains both `type` and `entityId`;
- subscribe/unsubscribe to click events;
- optionally expose a demo payload helper for diagnostics.

This keeps SDK-specific logic out of React components.

### UI flow

1. App starts.
2. `PushProvider` initializes OneSignal if configured.
3. `PushProvider` subscribes to the OneSignal `click` event.
4. User clicks a push notification.
5. Provider receives the event and reads `notification.additionalData`.
6. If payload contains both `type` and `entityId`, provider stores it in state and opens the modal.
7. User closes the modal, and provider clears the active payload.

## Data Contract

Required custom payload fields:

```json
{
  "type": "inspections",
  "entityId": "123"
}
```

The initial UI contract only requires those two fields. Future route navigation can reuse the same shape without changing the sender.

## Testing Strategy

- Unit-test payload parsing and validation in the push module.
- Unit-test demo helper output if it changes.
- Component-test provider behavior by mocking OneSignal listener registration and invoking the click callback:
  - opens modal when both `type` and `entityId` exist;
  - ignores invalid payloads;
  - closes modal on dismiss.

## Risks and Mitigations

- Browser permission prompts may require user gesture.
  - Mitigation: provider initializes SDK and listeners globally, but permission acquisition remains explicit where needed.
- OneSignal event types are loosely typed around `additionalData`.
  - Mitigation: parse into a narrow local type guard before using values.
- Global modal can conflict with future route navigation.
  - Mitigation: provider owns a single payload state and can later swap modal open for `navigate(...)`.

## Rollout

Phase 1:
- add provider;
- capture payload;
- open modal with `type` and `entityId`.

Phase 2:
- replace modal body with navigation to the inspection route once that page exists.
