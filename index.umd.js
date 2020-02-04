(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function memoize(fn) {
        if (fn.length === 1) {
            var wmap_1 = new WeakMap();
            var map_1 = {};
            return function (param) {
                var typeofParam = typeof param;
                var key;
                var value;
                if (typeofParam === 'function' || typeofParam === 'object' && param !== null) {
                    var wvalue = wmap_1.get(param);
                    if (wvalue === undefined) {
                        wvalue = fn(param);
                        wmap_1.set(param, wvalue);
                    }
                    return wvalue;
                }
                else {
                    key = param;
                }
                if (map_1.hasOwnProperty(key)) {
                    value = map_1[key];
                }
                else {
                    map_1[key] = value = fn(param);
                }
                return value;
            };
        }
        else {
            var args_1 = [];
            var vals_1 = [];
            return function () {
                var len = args_1.length;
                for (var j = len - 1; j >= 0; j--) {
                    var arg = args_1[j];
                    for (var i = arguments.length - 1; i >= 0 && arg[i] === arguments[i]; i--) {
                        if (i === 0) {
                            return vals_1[j];
                        }
                    }
                }
                args_1.push(arguments);
                var value = fn.apply(this, arguments);
                vals_1[len] = value;
                return value;
            };
        }
    }
    exports.memoize = memoize;
    exports["default"] = memoize;
});
