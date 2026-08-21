// src/index.ts
function memoize(fn) {
  if (fn.length === 1) {
    const wmap = new WeakMap;
    const map = {};
    return (param) => {
      const typeofParam = typeof param;
      let key;
      let value;
      if (typeofParam === "function" || typeofParam === "object" && param != null) {
        let wvalue = wmap.get(param);
        if (wvalue == null) {
          wvalue = fn(param);
          wmap.set(param, wvalue);
        }
        return wvalue;
      } else {
        key = param;
      }
      if (Object.hasOwn(map, key)) {
        value = map[key];
      } else {
        map[key] = value = fn(param);
      }
      return value;
    };
  } else {
    const args = [];
    const vals = [];
    return (...currentArgs) => {
      const len = args.length;
      for (let j = len - 1;j >= 0; j--) {
        const arg = args[j];
        for (let i = currentArgs.length - 1;i >= 0 && arg[i] === currentArgs[i]; i--) {
          if (i === 0) {
            return vals[j];
          }
        }
      }
      args.push(currentArgs);
      const value = fn.apply(this, currentArgs);
      vals[len] = value;
      return value;
    };
  }
}
var src_default = memoize;
export {
  src_default as default,
  memoize
};
