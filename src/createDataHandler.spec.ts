import { expect } from 'chai';
import { createDataHandler } from '.'; // Adjust the import path accordingly
import sinon from 'sinon'; // You can use sinon for creating spies

type AnyActionCreatorMap = {
  [k: string]: () => {
    type: string;
    payload: any;
  };
};


describe('createDataHandler', () => {

  afterEach(() => {
    sinon.restore(); // Reset all spies after each test
  });
  it('should invoke the correct handler when a data event with a known action is received', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
      reset: sinon.spy(),
    };

    // Create data handler
    const dataHandler = createDataHandler<AnyActionCreatorMap>(handlers);

    // Invoke data handler with a data event
    dataHandler({ data: { type: 'increment', payload: 1 } });

    // Assert that the correct handler was invoked
    expect(handlers.increment.calledOnceWith(1)).to.be.true;
    expect(handlers.reset.notCalled).to.be.true;
  });

  it('should invoke the default handler when a data event with an unknown action is received', () => {
    // Define action handlers and a default handler
    const handlers = {
      increment: sinon.spy(),
      default: sinon.spy(),
    };

    // Create data handler
    const dataHandler = createDataHandler<AnyActionCreatorMap>(handlers);

    // Invoke data handler with a data event with an unknown action
    dataHandler({ data: { type: 'unknown', payload: 1 } });

    // Assert that the default handler was invoked
    expect(handlers.default.calledOnceWith({ data: { type: 'unknown', payload: 1 } })).to.be.true;
    expect(handlers.increment.notCalled).to.be.true;
  });

  it('should not invoke any handler if an unknown action is received and no default handler is provided', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
    };

    // Create data handler
    const dataHandler = createDataHandler<AnyActionCreatorMap>(handlers);

    // Invoke data handler with a data event with an unknown action
    dataHandler({ data: { type: 'unknown', payload: 1 } });

    // Assert that no handler was invoked
    expect(handlers.increment.notCalled).to.be.true;
  });




  it('should accept any record of functions returning actions as generic input', () => () => {


    // Create handler
    createDataHandler<{ [k: string]: () => { type: 'a' } }>

    createDataHandler<{ [k: string]: () => { type: string } }>
    createDataHandler<{ [k: string]: () => { type: 'x'; payload: any; } }>
    createDataHandler<{ [k: string]: () => { type: 'x'; payload: unknown; } }>
    createDataHandler<{ [k: string]: () => { type: 'x'; payload: undefined; } }>
    createDataHandler<{ [k: string]: () => { type: 'x'; payload: number; } }>

  });

  it('should reject any prop of the wrong type', () => () => {


    // Create handler
    // @ts-expect-error missing type
    createDataHandler<{ a: () => {}; }>

    // @ts-expect-error wrong type
    createDataHandler<{ a: () => { type: number }; }>

    // @ts-expect-error does not return action
    createDataHandler<{ a: () => any[]; }>
  });

  it('should provide correct help for handler object', () => () => {

    type ActionTypes = { type: 'other'; payload: { a: number; b: string } }
      | { type: 'increment'; payload: number }
      | { type: 'reset'; payload: undefined }

    type ActionCreatorRecord = { [k: string]: (...args: any[]) => ActionTypes; };

    // Create handler
    createDataHandler<ActionCreatorRecord>({
      increment(payload: number) { },
      reset() { },
      other(payload: { a: number, b: string }) { }
    });
  });


});
