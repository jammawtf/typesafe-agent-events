import { expect } from 'chai';
import { bindActionDispatch } from './'; // Adjust the import path accordingly
import sinon from 'sinon'; // You can use sinon for creating spies

describe('bindActionDispatch', () => {
  it('should create action dispatchers', function () {
    // action creators
    const actions = {
      increment: (payload: number) => ({ type: 'increment', payload }),
      reset: () => ({ type: 'reset', payload: undefined }),
    };
    // Bind action creators to dispatch
    const boundActions = bindActionDispatch(actions, () => {/* do nothing */ });

    expect(boundActions).to.have.keys(['reset', 'increment']);
    expect(boundActions.increment).to.be.a('function');
    expect(boundActions.reset).to.be.a('function');
  })

  describe('dispatched actions', () => {
    it('should dispatch correct action with payload', () => {


      // action creators
      const actions = {
        increment: (payload: number) => ({ type: 'increment', payload }),

      };
      // Create a spy to act as the dispatch function
      const dispatch = sinon.spy();

      // Bind action creators to dispatch
      const boundActions = bindActionDispatch(actions, dispatch);

      // Define payload
      const payload = 1;

      // Invoke bound action creator
      boundActions.increment(payload);

      // Assert that dispatch was called with the correct action
      expect(dispatch.calledOnceWith({ type: 'increment', payload })).to.be.true;
    });
    it('should dispatch correct action with payload', () => {


      // action creators
      const actions = {
        other: (a: number, b: string) => ({ type: 'increment', payload: {a, b} }),

      };
      // Create a spy to act as the dispatch function
      const dispatch = sinon.spy();

      // Bind action creators to dispatch
      const boundActions = bindActionDispatch(actions, dispatch);


      const a = 1;
      const b = 'x';
      // Invoke bound action creator
      boundActions.other(a, b);

      // Assert that dispatch was called with the correct action
      expect(dispatch.calledOnceWith({ type: 'increment', payload: {a, b} })).to.be.true;
    });
    it('should dispatch correct action without payload', () => {
      const resetAction = { type: 'reset', payload: undefined };
      // action creators
      const actions = {
        reset: () => (resetAction),
      };

      // Create a spy to act as the dispatch function
      const dispatch = sinon.spy();

      // Bind action creators to dispatch
      const boundActions = bindActionDispatch(actions, dispatch);


      // Invoke bound action creator
      boundActions.reset();

      // Assert that dispatch was called with the correct action
      expect(dispatch.calledOnceWith(resetAction)).to.be.true;
    });

  });

  // TypeScript specific tests
  describe('TypeScript typings', () => {
    /** negative tests might well cause runtime errors, so we don't actually want to run the code */
    function typeTest(description: string, cb: () => void) {
      it(description, function () { cb });
    }
    describe('accepted action creators object', () => {
      typeTest('should accept props: function returning { type, payload? }', () => {

        bindActionDispatch({
          actiontype: (payload: number) => ({ type: 'actiontype', payload })
        },
          () => {/* do nothing */ }
        );

      })
      typeTest('should reject prop: function not returning action', () => {
        // @ts-expect-error
        bindActionDispatch({ actiontype: (payload: number) => payload }, () => {/* do nothing */ });
      })
      typeTest('should reject prop: not function', () => {
        // @ts-expect-error
        bindActionDispatch({ actiontype: { type: 't', payload: 1 } }, () => {/* do nothing */ });
      })
    })
    describe('returned action dispatchers', () => {
      const boundActions = bindActionDispatch({
        something: (a: number, b: string) => ({ type: 'increment', payload: { a, b } }),
        increment: (payload: number) => ({ type: 'increment', payload }),
        reset: () => ({ type: 'reset', payload: undefined }),
        
      }, () => {/* do nothing */ });
      typeTest('action creator object ', function () {
        //@ts-expect-error Type 'string' is not assignable to type 'never'
        const k: Exclude< keyof typeof boundActions,'something' | 'increment' | 'reset'> = ''; 
        
      })
      describe('action creator with 0 argument', () => {
        it('should accept 0 arguments', () => {
          boundActions.reset();
        });
        it('should reject 1 arguments', () => {
          // @ts-expect-error
          boundActions.reset(1);
        });
      });
      describe('action creator with 1 argument', () => {
        it('should reject 0 arguments', () => {
          // @ts-expect-error
          boundActions.increment();
        });
        it('should accept correct argument', () => {
          boundActions.increment(1);
        });
        it('should reject incorrect argument', () => {
          // @ts-expect-error
          boundActions.increment('1');
        });
      })
      describe('action creator with 2 arguments', () => {
        it('should reject 0 arguments', () => {
          // @ts-expect-error
          boundActions.something();
        });
        it('should reject 1 arguments', () => {
          // @ts-expect-error
          boundActions.something(1);
        });
        it('should accept correct arguments', () => {
          boundActions.something(1, '2');
        });
        it('should reject incorrect arguments', () => {
          // @ts-expect-error
          boundActions.something(1, 2);
        });
      });
    });
  });
});
