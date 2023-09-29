import { expect } from 'chai';
import { createHandler } from './'; // Adjust the import path accordingly
import sinon from 'sinon'; // You can use sinon for creating spies

type AnyActionCreatorMap = {
  [k: string]: () => {
    type: string;
    payload: any;
  };
};

describe('createHandler', () => {
  it('should invoke the correct handler when an action is received', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
      reset: sinon.spy(),
    };


    // Create handler
    const handler = createHandler<AnyActionCreatorMap>(handlers);

    // Invoke handler with an action
    handler({ type: 'increment', payload: 1 });

    // Assert that the correct handler was invoked
    expect(handlers.increment.calledOnceWith(1)).to.be.true;
    expect(handlers.reset.notCalled).to.be.true;
  });

  it('should return true if the action was handled', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
    };

    // Create handler
    const handler = createHandler<AnyActionCreatorMap>(handlers);

    // Assert that handler returns true for known action
    expect(handler({ type: 'increment', payload: 1 })).to.be.true;
  });

  it('should return false if the action was not handled', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
    };

    // Create handler
    const handler = createHandler<AnyActionCreatorMap>(handlers);

    // Assert that handler returns false for unknown action
    expect(handler({ type: 'unknown', payload: 1 })).to.be.false;
  });

  it('should not invoke any handler if an unknown action is received', () => {
    // Define action handlers
    const handlers = {
      increment: sinon.spy(),
      reset: sinon.spy(),
    };

    // Create handler
    const handler = createHandler<AnyActionCreatorMap>(handlers);

    // Invoke handler with an unknown action
    handler({ type: 'unknown', payload: 1 });

    // Assert that no handler was invoked
    expect(handlers.increment.notCalled).to.be.true;
    expect(handlers.reset.notCalled).to.be.true;
  });
  afterEach(() => {
    sinon.restore(); // Reset all spies after each test
  });
  it('should accept any record of functions returning actions as generic input', () => () => {


    // Create handler
    createHandler<{ [k: string]: () => { type: 'a' } }>

    createHandler<{ [k: string]: () => { type: string } }>
    createHandler<{ [k: string]: () => { type: 'x'; payload: any; } }>
    createHandler<{ [k: string]: () => { type: 'x'; payload: unknown; } }>
    createHandler<{ [k: string]: () => { type: 'x'; payload: undefined; } }>
    createHandler<{ [k: string]: () => { type: 'x'; payload: number; } }>

  });

  it('should reject any prop of the wrong type', () => () => {


    // Create handler
    // @ts-expect-error missing type
    createHandler<{ a: () => {}; }>

    // @ts-expect-error wrong type
    createHandler<{ a: () => { type: number }; }>

    // @ts-expect-error does not return action
    createHandler<{ a: () => any[]; }>
  });

  it('should provide correct help for handler object', () => () => {

    type ActionTypes = { type: 'other'; payload: { a: number; b: string } }
      | { type: 'increment'; payload: number }
      | { type: 'reset'; payload: undefined }

    type ActionCreatorRecord = { [k: string]: (...args: any[]) => ActionTypes; };

    // Create handler
    createHandler<ActionCreatorRecord>({
      increment(payload: number) { },
      reset() { },
      other(payload: { a: number, b: string }) { }
    });
  });


});
