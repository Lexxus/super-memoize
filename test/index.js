var chai,
	expect,
	memoize;

if (typeof window === "undefined") {
	chai = require("chai");
	expect = chai.expect;
	memoize = require("../index.js").memoize;
	// memoize = require('nano-memoize'); // 1 failed
	// memoize = require('fast-memoize'); // 1 failed
	// memoize = require('lodash').memoize; // passed
	// memoize = require('../benchmark/addy-osmani'); // passed
	// memoize = require('memoizerific'); // 7 failing
	// memoize = require('lru-memoize').default; // 7 failing
	// memoize = require('moize').default; // passed
	// memoize = require('micro-memoize') // 2 failed
	// memoize = require('iMemoized') // 2 failed
	// memoize = require('underscore').memoize // passed
}

const singleArg = memoize(function(arg) {
	return arg;
});

const multipleArg = memoize(function(arg1, arg2) {
	return { arg1, arg2 };
});

describe("Test", () => {
	it("should be faster than original", () => {
		// Vanilla Fibonacci

		let fibonacci = function(n) {
			return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
		};

		const vanillaExecTimeStart = Date.now();
		fibonacci(35);
		const vanillaExecTime = Date.now() - vanillaExecTimeStart;

		// Memoized

		fibonacci = memoize(fibonacci);

		const memoizedExecTimeStart = Date.now();
		fibonacci(35);
		const memoizedExecTime = Date.now() - memoizedExecTimeStart;

		console.log('faster on %dms', vanillaExecTime - memoizedExecTime);

		// Assertion

		expect(memoizedExecTime < vanillaExecTime).to.be.true;
	});

	it("memoize functions with function arg", () => {
		const memoized = memoize(function (fn) {
			return function (o) {
				return fn(o);
			};
		});
		const myFunc = memoized(function(o) { return o; });
		const result = myFunc(42);

		expect(typeof(memoized)).equal("function");
		expect(typeof(myFunc)).equal("function");
		expect(result).to.equal(42);
	});

	it("memoize functions with single arguments", () => {
		function plusPlus(number) {
			return number + 1;
		}

		const memoizedPlusPlus = memoize(plusPlus);

		expect(memoizedPlusPlus(1)).to.equal(2);
		expect(memoizedPlusPlus(1)).to.equal(2);
	});

	it("single primitive string arg cached", () => {
		const value = "42",
			result = singleArg(value);

		expect(result).to.equal(value);
	});

	it("single object arg cached", () => {
		const value = { p1: 42 },
			result = singleArg(value);

		expect(result).to.equal(value);
	});

	it("multiple arg primitive cached", () => {
		function nToThePower(n, power) {
			return Math.pow(n, power);
		}

		const memoizedNToThePower = memoize(nToThePower);

		expect(memoizedNToThePower(2, 3)).to.equal(8);
		expect(memoizedNToThePower(2, 3)).to.equal(8);
	});

	it("multiple arg object cached",function() {
		const p1 = {arg:1},
			p2 = {arg:2},
			{ arg1, arg2 } = multipleArg(p1, p2);

		expect(arg1.arg).to.equal(p1.arg);
		expect(arg2.arg).to.equal(p2.arg);
		expect(multipleArg(p1, p2)).to.deep.equal({ arg1: p1, arg2: p2});
	});

	it("multiple arg works with single", () => {
		const arg1 = {arg:1};
		const result = multipleArg(arg1);

		expect(result.arg1.arg).to.equal(1);
	});

	it("should call memoized function 5 times", () => {
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

		expect(runCount).to.equal(5);
		expect(results).to.deep.equal([0, false, null, undefined, 'true', 0, false, null, undefined, 'true']);
	});
});