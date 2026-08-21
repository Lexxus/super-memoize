# Super-Memoize

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Memoize function based on `nano-memoize` with some fixes and improvements.

## Installation

```console
$ npm install super-memoize
```

## Usage

```ts
import { memoize } from 'super-memoize';

const add = memoize((a: number, b: number) => a + b);

add(1, 2); // computed
add(1, 2); // cached
```

## Development

This project uses [Bun](https://bun.sh) to build, test, and minify, and [Biome](https://biomejs.dev) to lint and format.

```console
$ npm install
$ npm test
$ npm run build
$ npm run lint
$ npm run format
```

[npm-image]: https://img.shields.io/npm/v/super-memoize.svg
[npm-url]: https://npmjs.org/package/super-memoize
[downloads-image]: https://img.shields.io/npm/dm/super-memoize.svg
[downloads-url]: https://npmjs.org/package/super-memoize
