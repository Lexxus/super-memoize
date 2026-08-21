type MemoizeResult = (...p: any[]) => any;
export declare function memoize(fn: (...args: any[]) => any): MemoizeResult;
export default memoize;
