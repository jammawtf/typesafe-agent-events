
/**
 * Creates action creators based on the provided action map.
 * @param actionMap An object where keys are action types and values are payload transformation functions.
 * @returns An object containing action creators.
 * @example
 * ```ts
 * const actions = createActionCreators({
 *   increment: (payload: number) => payload,
 * });
 * ```
 */
export function createActionCreators<T extends { [k: string]: (payload?: any) => any }>(actionMap: T):
  {
    [K in keyof T]: T[K] extends ((p: infer P) => infer R) ? undefined extends P ? () => { type: K } : (payload: P) => { type: K; payload: R } : never;
  } {
  const acc = {} as { [k: string]: (...args: any[]) => void };
  for (const key in actionMap) {
    const getPayload = actionMap[key];
    acc[key] = (payload: any) => ({ type: key, payload: getPayload(payload) });
  }
  return acc as any;
}

/**
 * Binds action creators to a dispatch function, allowing actions to be dispatched directly.
 * @param actionsCreators An object containing action creators.
 * @param dispatch A function to dispatch actions.
 * @returns An object containing bound action dispatchers.
 * @example
 * ```ts
 * const boundActions = bindActionDispatch(actions, dispatchFunction);
 * ```
 */
export function bindActionDispatch<T extends { [k: string]: (payload?: any) => any }>(actions: T, dispatch: (action: any) => void): {
    [K in keyof T]: Parameters<T[K]>[0] extends infer P ? undefined extends P ? () => void : (payload: P) => void : never;
  } {
  const acc = {} as { [k: string]: (...args: any[]) => void };
  for (const key in actions) {
    const getEvent = actions[key];
    acc[key] = (payloadProp: any) => {
      dispatch(getEvent(payloadProp));
    }
  }
  return acc as any;
}

/**
 * Binds action creators to the postMessage method of an agent, allowing actions to be posted directly to the worker.
 * @param actions An object containing action creators.
 * @param agent An object with a postMessage method.
 * @returns An object containing bound action dispatchers.
 * @example
 * ```ts
 * const boundActions = bindPostMessage(actions, worker);
 * ```
 */
export function bindPostMessage<T extends { [k: string]: (payload?: any) => any }>(actions: T, worker: { postMessage: (event: MessageEvent) => void }) {
  return bindActionDispatch(actions, worker.postMessage.bind(worker));
}


/**
 * Creates a handler function to handle received actions based on the provided action handlers.
 * The handler function returns a boolean indicating whether the action was handled or not.
 * @param defs An object containing action handlers.
 * @returns A function to handle received actions. The returned function will return `true` if the action was handled, and `false` if it was not.
 * @example
 * ```ts
 * const handler = createHandler({
 *   increment: (payload) => console.log(payload),
 * });
 * const wasHandled = handler(someAction); // will be either true or false
 * ```
 */
export function createHandler<T extends { [k: string]: (payload?: any) => { type: string; payload?: any } }>(defs:
  {
    [k in keyof T]: ReturnType<T[k]> extends { type: string; payload: infer P } ? (payload: P) => void : () => void;
  }) {
    /**
   * Handles the received action based on the provided action handlers.
   * @param action The received action object containing `type` and `payload`.
   * @returns {boolean} A boolean value indicating whether the action was successfully handled. Returns `true` if the action was handled, and `false` if the action type was not recognized or if the action object was malformed.
   * @example
   * ```ts
   * const wasHandled = handleAction({ type: 'increment', payload: 1 }); // Returns true if 'increment' action is recognized and handled, otherwise returns false.
   * ```
   */
  return function handleAction(action: {
    [K in keyof T]: ReturnType<T[K]>;
  }[keyof T]) {
    if (!action || !action.type || !(action.type in defs)) { return false; }

    defs[action.type](action.payload);
    return true;
  }

}



/**
 * Creates a data handler function to handle received data events based on the provided action handlers.
 * An optional `default` handler can be provided to handle events for which no specific handler is defined.
 * @param defs An object containing action handlers and an optional default handler to handle any unspecified events.
 * @returns A function to handle received data events.
 * @example
 * ```ts
 * const dataHandler = createDataHandler({
 *   increment: (payload) => console.log(payload),
 *   default: (event) => console.error('Unhandled event:', event), // Optional default handler
 * });
 * dataHandler(someEvent); // Calls the corresponding handler or the default handler if no match is found
 * ```
 */
export function createDataHandler<T extends { [k: string]: (payload?: any) => any }>(defs: {
  // [k in keyof T]: T[k] extends (payload: infer P) => any ? (payload: P) => void : never;
  [k in keyof T]: ReturnType<T[k]> extends { type: string; payload: infer P } ? (payload: P) => void : () => void;
  // [k in keyof T]: VoidCallback<T[k]>
} & { default?: (event: any) => void }) {
  /** 
   * @param event object {data: {type, payload}}
   * 
   * if (there is no handler for event, and 'default' is defined, it will be called with the event)
   *  */
  return function (event: { data: { type: string; payload?: any } }) {

    const action = event?.data;
    if (!action || !action.type || !(action.type in defs)) {
      if (defs.default) {
        defs.default(event);
      }
      return;
    }
    defs[action.type](action.payload);

  }
}
