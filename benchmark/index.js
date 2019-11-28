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

const fibonacci = (number) => {
  return number < 2 ? number : fibonacci(number - 1) + fibonacci(number - 2);
};

const fibonacciSingleObject = (arg) => {
  const number = arg.number;

  if (number < 2) {
    return number;
  }
  arg.number = number - 1;
  const num1 = fibonacciSingleObject(arg);
  arg.number = number - 2;
  const num2 = fibonacciSingleObject(arg);

  return num1 + num2;
};

const fibonacciMultiplePrimitive = (number, isComplete) => {
  if (isComplete) {
    return number;
  }

  const firstValue = number - 1;
  const secondValue = number - 2;

  return (
    fibonacciMultiplePrimitive(firstValue, firstValue < 2) + fibonacciMultiplePrimitive(secondValue, secondValue < 2)
  );
};

const fibonacciMultipleObject = ({ number }, check) => {
  if (check.isComplete) {
    return number;
  }

  const firstValue = { number: number - 1 };
  const secondValue = { number: number - 2 };

  return (
    fibonacciMultipleObject(firstValue, {
      isComplete: firstValue.number < 2
    }) +
    fibonacciMultipleObject(secondValue, {
      isComplete: secondValue.number < 2
    })
  );
};

const fibonacciMultipleDeepEqual = ({number}) => {
  return number < 2
    ? number
    : fibonacciMultipleDeepEqual({number: number - 1}) + fibonacciMultipleDeepEqual({number: number - 2});
};

const runOders = [
  'nano-memoize',
  'super-memoize', 
  'addy-osmani',
  'lodash',
  'lru-memoize',
  'memoizee',
  'memoizerific',
  'underscore',
  'iMemoized',
  'micro-memoize',
  'moize',
  'fast-memoize'
]

function runBenchmark(title, benchmarkSuite, methods) {
  const args = [ ...arguments ].slice(3);

  return new Promise((resolve) => {
    const suite = methods.reduce((acc, method, i) => { 
      const name = runOders[i];
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

      return acc.add(name, () => {
        const result = method.apply(null, params);

        if (result !== validResult) {
          console.error(name + ' failed');
          // throw Error(name + ' failed');
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

  const mUnderscore = underscore(fibonacci);
  const mLodash = lodash(fibonacci);
  const mMemoizee = memoizee(fibonacci);
  const mFastMemoize = fastMemoize(fibonacci);
  const mAddyOsmani = addyOsmani(fibonacci);
  const mMemoizerific = memoizerific(Infinity)(fibonacci);
  const mLruMemoize = lruMemoize(Infinity)(fibonacci);
  const mMoize = moize(fibonacci);
  const mMicroMemoize = microMemoize(fibonacci);
  const mIMemoized = iMemoized.memoize(fibonacci);
  const mNano = nanomemoize(fibonacci);
  const mSuper = superMemoize(fibonacci);

  return runBenchmark(
    'Starting cycles for functions with a single primitive parameter...',
    fibonacciSuite,
    [
      mNano,
      mSuper,
      mAddyOsmani,
      mLodash,
      mLruMemoize,
      mMemoizee,
      mMemoizerific,
      mUnderscore,
      mIMemoized,
      mMicroMemoize,
      mMoize,
      mFastMemoize
    ],
    fibonacciNumber
  );
};

const runSingleParameterNumberSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter (Number)');
  const fibonacciNumber = Number(origNumber);

  const mUnderscore = underscore(fibonacci);
  const mLodash = lodash(fibonacci);
  const mMemoizee = memoizee(fibonacci);
  const mFastMemoize = fastMemoize(fibonacci);
  const mAddyOsmani = addyOsmani(fibonacci);
  const mMemoizerific = memoizerific(Infinity)(fibonacci);
  const mLruMemoize = lruMemoize(Infinity)(fibonacci);
  const mMoize = moize(fibonacci);
  const mMicroMemoize = microMemoize(fibonacci);
  const mIMemoized = iMemoized.memoize(fibonacci);
  const mNano = nanomemoize(fibonacci,{relaxed:true});
  const mSuper = superMemoize(fibonacci);

  return runBenchmark(
    'Starting cycles for functions with a single Number parameter...',
    fibonacciSuite,
    [
      mNano,
      mSuper,
      mAddyOsmani,
      mLodash,
      mLruMemoize,
      mMemoizee,
      mMemoizerific,
      mUnderscore,
      mIMemoized,
      mMicroMemoize,
      mMoize,
      mFastMemoize
    ],
    fibonacciNumber
  );
};

const runSingleParameterObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter (Object)');
  const fibonacciNumber = { number: origNumber };

  const mUnderscore = underscore(fibonacciSingleObject);
  const mLodash = lodash(fibonacciSingleObject);
  const mMemoizee = memoizee(fibonacciSingleObject);
  const mFastMemoize = fastMemoize(fibonacciSingleObject);
  const mAddyOsmani = addyOsmani(fibonacciSingleObject);
  const mMemoizerific = memoizerific(Infinity)(fibonacciSingleObject);
  const mLruMemoize = lruMemoize(Infinity)(fibonacciSingleObject);
  const mMoize = moize(fibonacciSingleObject);
  const mMicroMemoize = microMemoize(fibonacciSingleObject);
  const mIMemoized = iMemoized.memoize(fibonacciSingleObject);
  const mNano = nanomemoize(fibonacciSingleObject,{relaxed:true});
  const mSuper = superMemoize(fibonacciSingleObject);

  return runBenchmark(
    'Starting cycles for functions with a single Object parameter...',
    fibonacciSuite,
    [
      mNano,
      mSuper,
      mAddyOsmani,
      mLodash,
      mLruMemoize,
      mMemoizee,
      mMemoizerific,
      mUnderscore,
      mIMemoized,
      mMicroMemoize,
      mMoize,
      mFastMemoize
    ],
    fibonacciNumber
  );
};

const runMultiplePrimitiveSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Primitive)');
  const fibonacciNumber = origNumber;
  const isComplete = false;

  const mUnderscore = underscore(fibonacciMultiplePrimitive);
  const mLodash = lodash(fibonacciMultiplePrimitive);
  const mMemoizee = memoizee(fibonacciMultiplePrimitive);
  const mFastMemoize = fastMemoize(fibonacciMultiplePrimitive);
  const mAddyOsmani = addyOsmani(fibonacciMultiplePrimitive);
  const mMemoizerific = memoizerific(Infinity)(fibonacciMultiplePrimitive);
  const mLruMemoize = lruMemoize(Infinity)(fibonacciMultiplePrimitive);
  const mMoize = moize(fibonacciMultiplePrimitive);
  const mMicroMemoize = microMemoize(fibonacciMultiplePrimitive);
  const mIMemoized = iMemoized.memoize(fibonacciMultiplePrimitive);
  const mNano = nanomemoize(fibonacciMultiplePrimitive);
  const mSuper = superMemoize(fibonacciMultiplePrimitive);

  return runBenchmark(
    'Starting cycles for functions with multiple parameters that contain only primitives...',
    fibonacciSuite,
    [
      mNano,
      mSuper,
      mAddyOsmani,
      mLodash,
      mLruMemoize,
      mMemoizee,
      mMemoizerific,
      mUnderscore,
      mIMemoized,
      mMicroMemoize,
      mMoize,
      mFastMemoize
    ],
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

  const mUnderscore = underscore(fibonacciMultipleObject);
  const mLodash = lodash(fibonacciMultipleObject);
  const mMemoizee = memoizee(fibonacciMultipleObject);
  const mFastMemoize = fastMemoize(fibonacciMultipleObject);
  const mAddyOsmani = addyOsmani(fibonacciMultipleObject);
  const mMemoizerific = memoizerific(Infinity)(fibonacciMultipleObject);
  const mLruMemoize = lruMemoize(Infinity)(fibonacciMultipleObject);
  const mMoize = moize(fibonacciMultipleObject);
  const mMicroMemoize = microMemoize(fibonacciMultipleObject);
  const mIMemoized = iMemoized.memoize(fibonacciMultipleObject);
  const mNano = nanomemoize(fibonacciMultipleObject);
  const mSuper = superMemoize(fibonacciMultipleObject);
  
  return runBenchmark(
    'Starting cycles for functions with multiple parameters that contain objects...',
    fibonacciSuite,
    [
      mNano,
      mSuper,
      mAddyOsmani,
      mLodash,
      mLruMemoize,
      mMemoizee,
      mMemoizerific,
      mUnderscore,
      mIMemoized,
      mMicroMemoize,
      mMoize,
      mFastMemoize
    ],
    fibonacciNumber,
    isComplete
  );
};

// runSingleParameterSuite()
//   .then(runSingleParameterNumberSuite)
//   .then(runSingleParameterObjectSuite)
//   .then(runMultiplePrimitiveSuite)
//   .then(runMultipleObjectSuite);
const benchmarks = [
  runSingleParameterSuite,
  runSingleParameterNumberSuite,
  runSingleParameterObjectSuite,
  runMultiplePrimitiveSuite,
  runMultipleObjectSuite
];

benchmarks.reduce((acc, method, i) => {
  if (!processParams.length || processParams.includes(i.toString())) {
    if (acc) {
      return acc.then(method);
    }
    return method();
  }
  return acc;
}, null);
