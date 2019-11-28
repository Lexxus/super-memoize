(function(factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    const v = factory(require, exports);

    if (v !== undefined) {
      module.exports = v;
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['require', 'exports'], factory);
  } else if (typeof window === 'object') {
    factory(null, window);
  }
})(function(require, exports) {
  if (require) {
    exports.__esModule = true;
  }

  let lastId = 0;

  function memoize(fn) {
    if (fn.length === 1) {
      const wmap = new WeakMap();
      const map = {};

      return function(param) {
        const typeofParam = typeof param;
        let key;

        if (typeofParam === 'function') {
          key = param._$up3rmmz;

          if (key === undefined) {
            key = '$up3rmmz' + lastId++;
            param._$up3rmmz = key;
          }
        } else if (typeofParam === 'object' && param !== null) {
          let wvalue = wmap.get(param);

          if (wvalue === undefined) {
            wvalue = fn(param);
            wmap.set(param, wvalue);
          }

          return wvalue;
        } else {
          key = '' + param;
        }
        let value = map[key];

        if (value === undefined) {
          value = fn(param);
          map[key] = value;
        }

        return value;
      };
    } else {
      const args = [];
      const vals = [];

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

  exports.memoize = memoize;
});
