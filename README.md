<div align="center">

# MLab Speed Test

### Test your download and upload speed using [speed.measurementlab.net](https://speed.measurementlab.net/)

[![NPM](https://nodei.co/npm/mlab-speed-test.png?compact=true)](https://nodei.co/npm/mlab-speed-test/)
<br />
[![](https://img.shields.io/npm/dt/mlab-speed-test.svg?style=flat-square)](https://www.npmjs.com/package/mlab-speed-test)

</div>

[![NPM Version](https://badgen.net/npm/v/mlab-speed-test)](https://npmjs.org/package/mlab-speed-test)
[![Coverage Status](https://coveralls.io/repos/github/pichillilorenzo/mlab-speed-test/badge.svg?branch=main)](https://coveralls.io/github/pichillilorenzo/mlab-speed-test?branch=main)
[![license](https://img.shields.io/github/license/pichillilorenzo/mlab-speed-test)](/LICENSE)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/LorenzoPichilli)

## Getting started

To get started with this library, you need to install it and add it to your project.

### Installation

```bash
# npm
npm install mlab-speed-test --save

# yarn
yarn add mlab-speed-test
```

## Library Usage

API Reference available
at [https://pichillilorenzo.github.io/mlab-speed-test/](https://pichillilorenzo.github.io/mlab-speed-test/).

```javascript
import {MLabSpeedTest} from 'mlab-speed-test';
// or
const {MLabSpeedTest} = require('mlab-speed-test');

const speedTest = new MLabSpeedTest();
await speedTest.init();
await speedTest.run();
```

## CLI Usage

```
Usage: mlab-speed-test [options]

Examples: 
  mlab-speed-test
  mlab-speed-test --json

Options:
  -j, --json  Output data in json format (default: false)
  -h, --help  display help for command
```

## CLI Usage Example

#### Example 1

```bash
mlab-speed-test
```

Example output:

```bash

    Test Server: 🖥 Milan, IT
    55.65 Mb/s ↓ / 16.82 Mb/s ↑
    Latency: 32 ms
    Loss: 4.09%
    
```

#### Example 2

```bash
mlab-speed-test --json
```

Example output:

```json
{
  "isDone": false,
  "downloadSpeed": "54.97",
  "downloadUnit": "Mb/s",
  "downloadCompleted": false,
  "downloadProgress": 0.9007999999999999,
  "uploadSpeed": "0",
  "uploadUnit": "Mb/s",
  "uploadCompleted": false,
  "uploadProgress": 0,
  "latencyUnit": "ms",
  "lossUnit": "%",
  "testServer": "Milan, IT"
}
```

## Contributors

Any contribution is appreciated. You can get started with the steps below:

1. Fork [this repository](https://github.com/pichillilorenzo/mlab-speed-test) (learn how to do
   this [here](https://help.github.com/articles/fork-a-repo)).

2. Clone the forked repository.

3. Make your changes and create a pull
   request ([learn how to do this](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request))
   .

4. I will attend to your pull request and provide some feedback.

## License

This repository is licensed under the [ISC](LICENSE) License.

This project is strongly inspired by the [fast-cli](https://github.com/sindresorhus/fast-cli) package.
