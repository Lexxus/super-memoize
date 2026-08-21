import { describe, expect, it } from 'bun:test';
import { memoize } from '../src/index.ts';

const singleArg = memoize((arg) => arg);

const multipleArg = memoize((arg1, arg2) => ({ arg1, arg2 }));

describe('Test', () => {
  it('should be faster than original', () => {
    // Vanilla Fibonacci

    let fibonacci = (n) => (n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2));

    const vanillaExecTimeStart = Date.now();
    fibonacci(35);
    const vanillaExecTime = Date.now() - vanillaExecTimeStart;

    // Memoized

    fibonacci = memoize(fibonacci);

    const memoizedExecTimeStart = Date.now();
    fibonacci(35);
    const memoizedExecTime = Date.now() - memoizedExecTimeStart;

    console.log('faster on %dms', vanillaExecTime - memoizedExecTime);

    expect(memoizedExecTime).toBeLessThan(vanillaExecTime);
  });

  it('memoize functions with function arg', () => {
    const memoized = memoize((fn) => (o) => fn(o));
    const myFunc = memoized((o) => o);
    const result = myFunc(42);

    expect(typeof memoized).toBe('function');
    expect(typeof myFunc).toBe('function');
    expect(result).toBe(42);
  });

  it('memoize functions with single arguments', () => {
    function plusPlus(number) {
      return number + 1;
    }

    const memoizedPlusPlus = memoize(plusPlus);

    expect(memoizedPlusPlus(1)).toBe(2);
    expect(memoizedPlusPlus(1)).toBe(2);
  });

  it('single primitive string arg cached', () => {
    const value = '42';
    const result = singleArg(value);

    expect(result).toBe(value);
  });

  it('single object arg cached', () => {
    const value = { p1: 42 };
    const result = singleArg(value);

    expect(result).toBe(value);
  });

  it('multiple arg primitive cached', () => {
    function nToThePower(n, power) {
      return n ** power;
    }

    const memoizedNToThePower = memoize(nToThePower);

    expect(memoizedNToThePower(2, 3)).toBe(8);
    expect(memoizedNToThePower(2, 3)).toBe(8);
  });

  it('multiple arg object cached', () => {
    const p1 = { arg: 1 };
    const p2 = { arg: 2 };
    const { arg1, arg2 } = multipleArg(p1, p2);

    expect(arg1.arg).toBe(p1.arg);
    expect(arg2.arg).toBe(p2.arg);
    expect(multipleArg(p1, p2)).toEqual({ arg1: p1, arg2: p2 });
  });

  it('multiple arg works with single', () => {
    const arg1 = { arg: 1 };
    const result = multipleArg(arg1);

    expect(result.arg1.arg).toBe(1);
  });

  it('should call memoized function 5 times', () => {
    let runCount = 0;
    function getFalse(param) {
      runCount++;
      switch (param) {
        case '0':
          return 0;
        case 'false':
          return false;
        case 'null':
          return null;
        case 'undefined':
          return undefined;
        default:
          return param;
      }
    }
    const memoized = memoize(getFalse);
    const results = [];

    results.push(memoized('0'));
    results.push(memoized('false'));
    results.push(memoized('null'));
    results.push(memoized('undefined'));
    results.push(memoized('true'));

    results.push(memoized('0'));
    results.push(memoized('false'));
    results.push(memoized('null'));
    results.push(memoized('undefined'));
    results.push(memoized('true'));

    expect(runCount).toBe(5);
    expect(results).toEqual([0, false, null, undefined, 'true', 0, false, null, undefined, 'true']);
  });
});
