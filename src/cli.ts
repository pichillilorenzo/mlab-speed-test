#!/usr/bin/env node
import {Command} from 'commander';
import {render} from "ink";
import {MLab} from './ui';
import React from "react";
import {MLabSpeedTest} from "./index";

const program = new Command();

export interface MLabSpeedTestCommandOptions {
  json: boolean;
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
  await speedTest.init();
  await speedTest.run();
  await app.waitUntilExit();
}

async function run() {
  program
    .description(`Examples: 
  mlab-speed-test
  mlab-speed-test --json`)
    .option('-j, --json', 'Output data in json format', false)
    .action(runSpeedTest);
  await program.parseAsync();
}

run();
