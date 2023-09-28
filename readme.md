# TypeSafe Agent Actions

`typesafe-agent-actions` is a minimalistic TypeScript library designed to facilitate seamless and type-safe communications between different agents like web workers or iframes in web development environments. It addresses the common challenges developers face when managing communications between disparate system components, particularly when dealing with various action types and payloads.

This library is especially useful when you need to ensure the integrity and reliability of messages passed between different parts of your application, preventing issues related to message type mismatches and ensuring that the payloads conform to expected types.

## Prerequisites
- The purpose of the library is to provide help with types, and is not be suitable for projects not utilizing TypeScript.


## Why TypeSafe Agent Actions?

Developing efficient and scalable web applications often requires the integration of different system components. Managing communications between these components can be challenging and error-prone, especially when dealing with various types of payloads and actions.

`typesafe-agent-actions` offers a simple and lightweight solution to these challenges, enabling developers to define, create, and handle actions with type safety. It aims to provide a straightforward approach to managing communications between different components without the need for complex setups or heavy libraries.

## Installation

```
npm install typesafe-agent-actions
```

## Usage


### Defining Actions

Define actions using the `createActionCreators` function. This function takes a configuration object where you specify the actions and their associated payloads.

```ts
// workerApi.ts
import { createActionCreators } from 'typesafe-agent-actions';

type WorkConfig = {...}; // Define the shape of your work configuration

// Define actions to be sent to the worker
export const toWorker = createActionCreators({
  start: (payload: WorkConfig) => payload, // Action with a payload
  stop: () => undefined, // Action without a payload
});

// Define actions to be received from the worker
export const fromWorker = createActionCreators({
  progress: (payload: number) => payload,
  done: (payload: string) => payload,
});
```

### Sending Actions


Use `bindActionDispatch` to associate an action creator object with a dispatch function, enabling the sending of actions with full type safety.

```ts
import { toWorker } from './workerApi';
import { bindActionDispatch } from 'typesafe-agent-actions';

const worker = new Worker('./worker.ts', { type: 'module' });
const postToWorker = bindActionDispatch(toWorker, (action) => worker.postMessage(action));

postToWorker.start({ ... }); // Send a 'start' action to the worker
```



### Handling Actions

`createHandler` provides type-help when defining a handler function, using the type of an action creators object.

```ts 
import { fromWorker } from './workerApi';
import { createHandler } from 'typesafe-agent-actions';

const worker = new Worker('./worker.ts', { type: 'module' });
const handler = createHandler<typeof fromWorker>({
  progress(payload) { ... },
  done(payload) { ... },
});

worker.onmessage = (event) => {
  handler(event.data);
};
```


### worker example

Here's how you can set up `typesafe-agent-actions` within a worker to handle actions and communicate back to the main thread:

```ts
// worker.ts
import { fromWorker, toWorker } from './workerApi';
import { createHandler, bindActionDispatch } from 'typesafe-agent-actions';

// Bind actions to post messages back to the main thread
const postToMain = bindActionDispatch(fromWorker, self.postMessage.bind(self));

// Assume DoerOfWork is a hypothetical object representing a task doer in your application
const task = new DoerOfWork();

// Create a handler to manage incoming actions from the main thread
const handler = createHandler<typeof toWorker>({
  start(payload) {
    // Start the task and set up callbacks for progress and completion
    task.start({
      config: payload,
      onProgress: (progress) => postToMain.progress(progress), 
      onDone: (result) => postToMain.done(result)
    });
  },
  stop() {
    // Stop the ongoing task
    task.stop();
  },
});

```

# API Documentation

## `createActionCreators`

### Description
Creates action creators based on the provided action map.

### Parameters
- `actionMap` (Object): An object where keys are action types and values are payload transformation functions.

### Return Type
An object containing action creators.

### Example
```ts
const actions = createActionCreators({
  increment: (payload: number) => payload,
});
```

## `bindActionDispatch`

### Description
Binds action creators to a dispatch function, allowing actions to be dispatched directly.

### Parameters
- `actionsCreators: {[type:string]: (payload) => {type, payload}}`: An object containing action creators.
- `dispatch: (action: any) => void`: A function to dispatch actions.
### Return Type
An object containing bound action dispatchers. The dis

Example

```ts
const boundActions = bindActionDispatch(actions, dispatchFunction);
```

## `bindPostMessage`
### Description
Binds action creators to the postMessage method of an agent, allowing actions to be posted directly to the worker.

### Parameters
- `actions: T (Object)`: An object containing action creators.
- `agent: { postMessage: (event: MessageEvent) => void }`: An object with a postMessage method.
### Return Type
An object containing bound action dispatchers.

### Example
```ts
const boundActions = bindPostMessage(actions, worker);
```

## `createHandler`

### Description
Creates a handler function to handle received actions based on the provided action handlers. The handler function returns a boolean indicating whether the action was handled or not.

### Parameters
- `defs: { [k in keyof T]: (payload: any) => void }`: An object containing action handlers.

### Return Type
A function to handle received actions. The returned function will return `true` if the action was handled, and `false` if it was not.

### Example
```ts
const handler = createHandler<typeof actionCreators>({
  increment: (payload) => console.log(payload),
});

const wasHandled = handler(someAction); // will be either true or false
```



## `createDataHandler`

### Description
Creates a data handler function to handle received data events based on the provided action handlers. An optional `default` handler can be provided to handle events for which no specific handler is defined.

### Parameters
- `defs: { [k in keyof T]: (payload: any) => void } & { default?: (event: any) => void }` (Object): An object containing action handlers and an optional default handler to handle any unspecified events.

### Return Type
A function to handle received data events.

### Example
```ts
const dataHandler = createDataHandler({
  increment: (payload) => console.log(payload),
  default: (event) => console.error('Unhandled event:', event), // Optional default handler
});

dataHandler(someEvent); // Calls the corresponding handler or the default handler if no match is found
```

## License

`typesafe-agent-actions` is released under the [MIT License](LICENCE).