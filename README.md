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
speedTest.on('server-chosen', (serverInfo) => {
   console.log(serverInfo.location);
});
speedTest.on('download-complete', downloadData => {
   const downloadSpeed = downloadData.LastClientMeasurement ? downloadData.LastClientMeasurement.MeanClientMbps.toFixed(2) : '0';
   console.log(downloadSpeed + 'Mb/s');
});
speedTest.on('upload-complete', uploadData => {
   const uploadSpeed = uploadData.LastServerMeasurement ?
           (uploadData.LastServerMeasurement.TCPInfo.BytesReceived / uploadData.LastServerMeasurement.TCPInfo.ElapsedTime * 8).toFixed(2) : '0';
   console.log(uploadSpeed + 'Mb/s');
});
const exitCode = await speedTest.run();
```

## CLI Usage

```
Usage: mlab-speed-test [options]

Examples: 
  mlab-speed-test -a -p
  mlab-speed-test -a -p --json

Options:
  -p, --accept-privacy-policy  Accept M-Lab's Privacy Policy (https://www.measurementlab.net/privacy/) (default: false)
  -a, --autostart              Run speed test on command start. Requires --accept-privacy-policy (default: false)
  --json                       Output data in json format (default: false)
  --pretty                     If json should be pretty formatted (default: false)
  -h, --help                   display help for command
```

## CLI Usage Example

#### Example 1

```bash
mlab-speed-test -a -p
```

Example output:

```bash

    M-Lab's Speed Test

    ⊠ Privacy Policy ( https://www.measurementlab.net/privacy/ )

    Test Server: 🖥  Milan, IT
  ⠸ 65.98 Mb/s ↓ / 17.04 Mb/s ↑
    Latency: 26 ms
    Loss: 1.81%

    Restart (enter) - Stop (delete)
    Decline Privacy Policy (a) - Quit (ctrl + q)

```

#### Example 2

```bash
mlab-speed-test -ap --json --pretty
```

Example output:

```json
{
   "privacyPolicyAccepted": true,
   "running": true,
   "isDone": false,
   "downloadSpeed": "64.80",
   "downloadUnit": "Mb/s",
   "downloadCompleted": true,
   "downloadProgress": 1,
   "uploadSpeed": "16.97",
   "uploadUnit": "Mb/s",
   "uploadCompleted": false,
   "uploadProgress": 0.6515323619008064,
   "latencyUnit": "ms",
   "lossUnit": "%",
   "location": {
      "city": "Milan",
      "country": "IT"
   },
   "latency": "51",
   "loss": "6.57"
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
