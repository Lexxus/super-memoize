declare type MemoizeResult = (...p: any[]) => any;
export declare function memoize(fn: Function): MemoizeResult;
export default memoize;
