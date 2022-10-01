#!/usr/bin/env node
import {Command} from 'commander';
import {render} from "ink";
import {MLab} from './ui';
import React from "react";
import {MLabSpeedTest} from "./index";

process.stdin.resume();
process.on('SIGINT', function() {
  process.exit();
});

const program = new Command();

export interface MLabSpeedTestCommandOptions {
  acceptPrivacyPolicy: boolean;
  autostart: boolean;
  json: boolean;
  pretty: boolean;
}

async function runSpeedTest() {
  // @ts-ignore
  const options: MLabSpeedTestCommandOptions = {
    ...program.opts()
  };

  const speedTest = new MLabSpeedTest();
  const app = render(React.createElement(MLab, {
    speedTest,
    options
  }));
  if (options.acceptPrivacyPolicy && options.autostart) {
    speedTest.run();
  }
  await app.waitUntilExit();
}

async function run() {
  program
    .description(`Examples: 
  mlab-speed-test -a -p
  mlab-speed-test -a -p --json`)
    .option('-p, --accept-privacy-policy', 'Accept M-Lab\'s Privacy Policy (https://www.measurementlab.net/privacy/)', false)
    .option('-a, --autostart', 'Run speed test on command start. Requires --accept-privacy-policy', false)
    .option('--json', 'Output data in json format', false)
    .option('--pretty', 'If json should be pretty formatted', false)
    .action(runSpeedTest);
  await program.parseAsync();
}

run();
