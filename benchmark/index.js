'use strict';

/*MIT License
Core benchmark code copied from micro-memoize

Copyright (c) 2018 Tony Quetano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Benchmark = require('benchmark');
const Table = require('cli-table2');
const ora = require('ora');

const underscore = require('underscore').memoize;
const lodash = require('lodash').memoize;
const memoizee = require('memoizee');
const fastMemoize = require('fast-memoize');
const addyOsmani = require('./addy-osmani');
const memoizerific = require('memoizerific');
const lruMemoize = require('lru-memoize').default;
const moize = require('moize').default;
const microMemoize = require('micro-memoize'); 
const iMemoized = require('iMemoized');
const nanomemoize = require('nano-memoize');
const superMemoize = require('../index.js').memoize;

const processParams = process.argv.slice(2);

const showResults = (benchmarkResults) => {
  const table = new Table({
    head: ['Name', 'Ops / sec', 'Relative margin of error', 'Sample size']
  });

  benchmarkResults.forEach((result) => {
    const name = result.target.name;
    const opsPerSecond = result.target.hz.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
    const relativeMarginOferror = `± ${result.target.stats.rme.toFixed(2)}%`;
    const sampleSize = result.target.stats.sample.length;

    table.push([name, opsPerSecond, relativeMarginOferror, sampleSize]);
  });

  console.log(table.toString()); // eslint-disable-line no-console
};

const sortDescResults = (benchmarkResults) => {
  return benchmarkResults.sort((a, b) => {
    return a.target.hz < b.target.hz ? 1 : -1;
  });
};

const spinner = ora('Running benchmark');

let results = [];

const origNumber = 34;
const validResult = 5702887;

const onCycle = (event) => {
  results.push(event);
  ora(event.target.name).succeed();
};

const onComplete = () => {
  spinner.stop();

  const orderedBenchmarkResults = sortDescResults(results);

  showResults(orderedBenchmarkResults);
};

function getFibonnacciSinglePrimitive(memo) {
  let fibonacci = function(number) {
    return number < 2 ? number : fibonacci(number - 1) + fibonacci(number - 2);
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function getFibonacciSingleObject(memo) {
  let fibonacci = function({ number }) {
    return number < 2 ? number : fibonacci({ number: number - 1}) + fibonacci({ number: number - 2});
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function getFibonacciMutatedObject(memo) {
  let fibonacci = function(arg) {
    const number = arg.number;

    if (number < 2) {
      return number;
    }
    arg.number = number - 1;
    const num1 = fibonacci(arg);
    arg.number = number - 2;
    const num2 = fibonacci(arg);

    return num1 + num2;
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function getFibonacciMultiplePrimitives(memo) {
  let fibonacci = function(number, isComplete) {
    if (isComplete) {
      return number;
    }
    const firstValue = number - 1;
    const secondValue = number - 2;

    return (
      fibonacci(firstValue, firstValue < 2) + fibonacci(secondValue, secondValue < 2)
    );
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function getFibonacciMultipleObjects(memo) {
  let fibonacci = function({ number }, check) {
    if (check.isComplete) {
      return number;
    }

    const firstValue = { number: number - 1 };
    const secondValue = { number: number - 2 };

    return (
      fibonacci(firstValue, {
        isComplete: firstValue.number < 2
      }) +
      fibonacci(secondValue, {
        isComplete: secondValue.number < 2
      })
    );
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function getFibonacciFunction(memo) {
  let fibonacci = function(number, getFirstNum, getSecondNum) {
    return number < 2
      ? number
      : fibonacci(getFirstNum(number), getFirstNum, getSecondNum) +
        fibonacci(getSecondNum(number), getFirstNum, getSecondNum);
  };

  // fibonacci = memo(fibonacci);

  return memo(fibonacci);
}

function runBenchmark(title, benchmarkSuite, getFibonacci) {
  const args = [ ...arguments ].slice(3);
  const methods = {
    'super-memoize': superMemoize,
    underscore: underscore,
    lodash: lodash,
    memoizee: memoizee,
    'addy-osmani': addyOsmani,
    memoizerific: memoizerific(Infinity),
    'lru-memoize': lruMemoize(Infinity),
    moize: moize,
    iMemoized: iMemoized.memoize.bind(iMemoized),
    'micro-memoize': microMemoize,
    'fast-memoize': fastMemoize,
    'nano-memoize': nanomemoize
  };

  return new Promise((resolve, reject) => {
    const suite = Object.keys(methods).reduce((acc, name, i) => { 
      const method = methods[name];
      const params = args.map((arg) => {
        let res;
        if (arg !== null && typeof arg === 'object') {
          if (Array.isArray(arg)) {
            res = [];
          } else {
            res = {};
          }
          Object.assign(res, arg);
        } else {
          res = arg;
        }
        return res;
      });
      const fibonacci = getFibonacci(method);

      return acc.add(name, () => {
        const result = fibonacci(...params);

        if (result !== validResult) {
          // console.error(name + ' failed');
          // throw Error(name + ' failed');
          reject(` ${name} failed due to wrong result ${result} !== ${validResult}`);
        }
      });
     }, benchmarkSuite);

    suite
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log(title); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
}

const runSingleParameterSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter (Primitive)');
  const fibonacciNumber = origNumber;

  return runBenchmark(
    'Starting cycles for functions with a single primitive parameter...',
    fibonacciSuite,
    getFibonnacciSinglePrimitive,
    fibonacciNumber
  );
};

const runSingleParameterObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter (Object)');
  const fibonacciNumber = { number: origNumber };

  return runBenchmark(
    'Starting cycles for functions with a single Object parameter...',
    fibonacciSuite,
    getFibonacciSingleObject,
    fibonacciNumber
  );
};

const runSingleParameterMutableObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter (Mutated Object)');
  const fibonacciNumber = { number: origNumber };

  return runBenchmark(
    'Starting cycles for functions with a single Mutable Object parameter...',
    fibonacciSuite,
    getFibonacciMutatedObject,
    fibonacciNumber
  );
};

const runMultiplePrimitiveSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Primitive)');
  const fibonacciNumber = origNumber;
  const isComplete = false;

  return runBenchmark(
    'Starting cycles for functions with multiple parameters that contain only primitives...',
    fibonacciSuite,
    getFibonacciMultiplePrimitives,
    fibonacciNumber,
    isComplete
  );
};

const runMultipleObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Object)');
  const fibonacciNumber = { number: origNumber };
  const isComplete = {
    isComplete: false
  };

  return runBenchmark(
    'Starting cycles for functions with multiple parameters that contain objects...',
    fibonacciSuite,
    getFibonacciMultipleObjects,
    fibonacciNumber,
    isComplete
  );
};

const runFunctionSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Functions)');
  const fibonacciNumber = origNumber;
  const getFirstNum = (num) => num - 1;
  const getSecondNum = (num) => num - 2;

  return runBenchmark(
    'Starting cycles for functions with multiple parameters that contain functions...',
    fibonacciSuite,
    getFibonacciFunction,
    fibonacciNumber,
    getFirstNum,
    getSecondNum
  );
};

const benchmarks = [
  runSingleParameterSuite,
  runSingleParameterObjectSuite,
  runSingleParameterMutableObjectSuite,
  runMultiplePrimitiveSuite,
  runMultipleObjectSuite,
  runFunctionSuite
];

function handleError(err) {
  console.log(err);
}

benchmarks.reduce((acc, method, i) => {
  if (!processParams.length || processParams.includes(i.toString())) {
    if (acc) {
      return acc.then(method).catch(handleError);
    }
    return method().catch(handleError);
  }
  return acc;
}, null);
