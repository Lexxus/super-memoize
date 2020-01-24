export function memoize(fn: Function) {
  if (fn.length === 1) {
    const wmap = new WeakMap();
    const map: Record<string, any> = {};

    return function(param: any) {
      const typeofParam = typeof param;
      let key: any;
      let value: any;

      if (typeofParam === 'function' || typeofParam === 'object' && param !== null) {
        let wvalue = wmap.get(param);

        if (wvalue === undefined) {
          wvalue = fn(param);
          wmap.set(param, wvalue);
        }

        return wvalue;
      } else {
        key = param;
      }

      if (map.hasOwnProperty(key)) {
        value = map[key];
      } else {
        map[key] = value = fn(param);
      }

      return value;
    };
  } else {
    const args: any[] = [];
    const vals: any[] = [];

    return function() {
      const len = args.length;

      for (let j = len - 1; j >= 0; j--) {
        const arg = args[j];

        for (let i = arguments.length- 1; i >= 0 && arg[i] === arguments[i]; i--) {
          if (i === 0) {
            return vals[j];
          }
        }
      }

      args.push(arguments);

      const value = fn.apply(this, arguments);

      vals[len] = value;

      return value;
    };
  }
}

export default memoize;
