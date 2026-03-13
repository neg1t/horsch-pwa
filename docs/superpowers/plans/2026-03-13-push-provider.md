# Push Provider Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global OneSignal push provider that listens for notification clicks and opens a modal when payload contains both `type` and `entityId`.

**Architecture:** Keep OneSignal SDK details in the shared push module and keep React state/UI concerns in a single app-level provider. Mount the provider near the app root so notification click handling becomes route-independent and can later evolve from modal display into navigation.

**Tech Stack:** React 19, react-router-dom 7, antd 5, react-onesignal 3, Vitest

---

## Chunk 1: Push Module Helpers

### Task 1: Add payload parser helpers in the shared push module

**Files:**
- Modify: `D:\src\horsh\horsch-pwa\src\shared\lib\push\onesignal.ts`
- Modify: `D:\src\horsh\horsch-pwa\src\shared\lib\push\index.ts`
- Test: `D:\src\horsh\horsch-pwa\src\shared\lib\push\onesignal.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for:
- valid payload returns `{ type, entityId }`
- missing `type` returns `null`
- missing `entityId` returns `null`
- non-string values return `null`

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: FAIL because parser helpers do not exist yet

- [ ] **Step 3: Write minimal implementation**

Add:
- a narrow `PushClickPayload` type;
- a parser for unknown `additionalData`;
- exports for the new helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/push/onesignal.ts src/shared/lib/push/index.ts src/shared/lib/push/onesignal.test.ts
git commit -m "test: cover push payload parsing"
```

### Task 2: Add click-listener helper around OneSignal

**Files:**
- Modify: `D:\src\horsh\horsch-pwa\src\shared\lib\push\onesignal.ts`
- Test: `D:\src\horsh\horsch-pwa\src\shared\lib\push\onesignal.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for:
- listener subscribes to OneSignal `click`
- invalid payload does not reach consumer
- valid payload reaches consumer with `{ type, entityId }`

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: FAIL because subscription helper does not exist yet

- [ ] **Step 3: Write minimal implementation**

Add a helper that:
- loads OneSignal;
- registers a `click` listener;
- parses `notification.additionalData`;
- calls the consumer only for valid payloads;
- returns an unsubscribe function.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/push/onesignal.ts src/shared/lib/push/onesignal.test.ts
git commit -m "feat: add push click subscription helper"
```

## Chunk 2: App Provider

### Task 3: Add the global push provider

**Files:**
- Create: `D:\src\horsh\horsch-pwa\src\app\providers\push\index.tsx`
- Modify: `D:\src\horsh\horsch-pwa\src\app\index.tsx`
- Test: `D:\src\horsh\horsch-pwa\src\app\providers\push\index.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add provider tests for:
- modal opens after valid click payload
- modal stays closed after invalid click payload
- modal closes when user dismisses it

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/app/providers/push/index.test.tsx`
Expected: FAIL because provider does not exist yet

- [ ] **Step 3: Write minimal implementation**

Provider behavior:
- subscribe on mount;
- store active payload in state;
- render `antd` `Modal`;
- clear payload on close.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/app/providers/push/index.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/providers/push/index.tsx src/app/index.tsx src/app/providers/push/index.test.tsx
git commit -m "feat: add global push provider"
```

## Chunk 3: Diagnostics Page Alignment

### Task 4: Remove profile page dependency on push-open query params

**Files:**
- Modify: `D:\src\horsh\horsch-pwa\src\pages\Profile\ui\Profile.tsx`
- Modify: `D:\src\horsh\horsch-pwa\src\pages\Profile\ui\PushNotificationsCard.tsx`
- Test: `D:\src\horsh\horsch-pwa\src\shared\lib\push\onesignal.test.ts`

- [ ] **Step 1: Write the failing tests**

Adjust helper tests so demo data reflects payload-based click handling instead of `orderId`.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: FAIL because old helper output still uses `orderId`

- [ ] **Step 3: Write minimal implementation**

Update diagnostics UI:
- stop reading push-open state from route query;
- show an example payload contract instead of old order-based deep link;
- keep manual link/permission controls intact.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/shared/lib/push/onesignal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Profile/ui/Profile.tsx src/pages/Profile/ui/PushNotificationsCard.tsx src/shared/lib/push/onesignal.test.ts
git commit -m "refactor: align profile push diagnostics with provider flow"
```

## Chunk 4: Verification

### Task 5: Run full verification

**Files:**
- Verify only

- [ ] **Step 1: Run focused tests**

Run: `yarn test src/shared/lib/push/onesignal.test.ts src/app/providers/push/index.test.tsx`
Expected: PASS

- [ ] **Step 2: Run type check**

Run: `yarn ts:check`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `yarn lint`
Expected: PASS

- [ ] **Step 4: Run architecture check**

Run: `yarn fsd:check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: handle push payload clicks globally"
```
