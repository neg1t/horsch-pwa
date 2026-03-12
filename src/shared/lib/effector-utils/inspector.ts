import { type Message, inspect } from 'effector/inspect'

export function enableScopeInspector() {
  /**
   * Catch Scope-less Calls
   */
  inspect({
    /**
     * Explicitly define that we will
     * catch only messages where Scope is undefined
     */
    scope: undefined,
    trace: true,
    fn: (m: Message) => {
      const name = `${m.kind} ${m.name}`
      const error = new Error(`${name} is not bound to scope`)

      console.error(error)
    },
  })
}
