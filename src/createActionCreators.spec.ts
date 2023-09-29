import { expect } from 'chai';
import { createActionCreators } from './'; // Adjust the import path accordingly

describe('createActionCreators', () => {

  it('should create action creators correctly', () => {
    // Define action map
    const actionMap = {
      increment: (payload: number) => payload,
      reset: () => undefined,
    };

    // Create action creators
    const actions = createActionCreators(actionMap);

    // Assert that the correct action creators are created
    expect(actions).to.have.keys(['reset', 'increment']);
  });

  it('should create correct action objects when action creators are invoked', () => {
    // Define action map
    const actionMap = {
      increment: (payload: number) => payload,
      reset: () => undefined,
      other: (a: string, b: number) => ({a, b}),

    };

    // Create action creators
    const actions = createActionCreators(actionMap);

    // Assert that invoking action creators returns the correct action objects
    expect(actions.increment(1)).to.deep.equal({ type: 'increment', payload: 1 });
    const resetAction: any = actions.reset();
    expect(resetAction).to.have.property('type', 'reset');
    expect(resetAction.payload).to.be.undefined;
    expect(actions.other('a', 1)).to.deep.equal({ type: 'other', payload: {a: 'a', b: 1} });
  });

  describe('typings', () => {
    /** negative tests might well cause runtime errors, so we don't actually want to run the code */
    function typeTest(description: string, cb: () => void) {
      it(description, function() {cb});
    }
    describe('createActionCreators argument type', () => {
      typeTest('should accept props that are functions', () => {
        createActionCreators({
          increment: (payload: number) => payload,
          reset: () => undefined,
          other: (a: string, b: number) => ({a, b}),
        });
      })
      typeTest('should reject non-function properties', () => {
        //@ts-expect-error
        createActionCreators({a: 1}); // Error: Type 'number' is not assignable to type '(payload?: any) => any'.
        //@ts-expect-error
        createActionCreators({a: {}}); // Error: Type '{}' is not assignable to type '(payload?: any) => any'.
        //@ts-expect-error
        createActionCreators({a: undefined}); // Error: Type 'undefined' is not assignable to type '(payload?: any) => any'.
      })
      
      typeTest('should reject missing argument', () => {
        //@ts-expect-error
        createActionCreators(); // Error: Expected 1 arguments, but got 0.
      })
      typeTest('should reject extra argument', () => {
        //@ts-expect-error
        createActionCreators({}, {}); // Error: Expected 1 arguments, but got 2.
      })
    })
    describe('action creator argument type', () => {
      // Define action map
      const actionMap = {
        increment: (payload: number | boolean) => payload.toString(),
        reset: () => undefined,
      };
    
      // Create action creators
      const actions = createActionCreators(actionMap);
      typeTest('should accept correct input', () => {
        actions.increment(1);
        actions.increment(false);
      })
      typeTest('should accept 0 arguments for actions with no payload', () => {
        actions.reset();
      })

      typeTest('should reject incorrect argument type', () => {
        //@ts-expect-error
         actions.increment('1'); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.
      })
      typeTest('should reject missing argument', () => {
        //@ts-expect-error
        actions.increment(); // Error: Expected 1 arguments, but got 0.
      })
      typeTest('should reject extra argument', () => {
        //@ts-expect-error
        actions.reset(1); // Error: Expected 0 arguments, but got 1.
      })
    })
    describe('createActionCreators return types', () => {
      // Define action map
      const actionMap = {
        increment: (payload: number | string) => payload.toString(),
        reset: () => undefined,
      };
    
      // Create action creators
      const actions = createActionCreators(actionMap);
    
      describe('action creator return type', () => {
        typeTest('should return correct action object for actions with payload', () => {
          const action = actions.increment(1);
          
          // This should be OK
          const payload: string = action.payload;
          
          // @ts-expect-error
          const incorrectPayload: number = action.payload; // Error: Type 'string' is not assignable to type 'number'.
          
          // This should be OK
          const type: 'increment' = action.type;
          
          // @ts-expect-error
          const incorrectType: 'reset' = action.type; // Error: Type '"increment"' is not assignable to type '"reset"'.
        });
    
        typeTest('should return correct action object for actions without payload', () => {
          const action = actions.reset();
          
          // This should be OK
          const type: 'reset' = action.type;
          
          // @ts-expect-error
          const incorrectType: 'increment' = action.type; // Error: Type '"reset"' is not assignable to type '"increment"'.
          
          const payload: undefined = action.payload; 
        });
      });
    });
    
  })
});

