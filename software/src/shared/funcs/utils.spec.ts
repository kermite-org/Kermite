import { copyObjectProps } from './utils';

describe('copyObjectProps', () => {
  test('basic usage', () => {
    const target = {
      foo: 100,
      bar: 200,
    } as any;
    const source = {
      bar: 300,
      buzz: 400,
    } as any;
    copyObjectProps(target, source);
    expect(target.foo).toBe(100);
    expect(target.bar).toBe(300);
    expect(target.buzz).toBe(undefined);
  });
});
