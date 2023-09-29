import { bindPostMessage } from '.';

describe('bindPostMessage', () => {
  it('should accept object with postMessage method', () => () => {
    bindPostMessage({}, { postMessage: () => { } });
  })
  it('should reject object without postMessage method', () => () => {

    //@ts-expect-error
    bindPostMessage({}, {});
  })
})