import {describe, expect, test} from '@jest/globals';
import {MLabSpeedTest} from '../src';

jest.setTimeout(60000);

describe('mlab-speed-test', () => {
  test('basic usage', async () => {
    const speedTest = new MLabSpeedTest();
    speedTest.on('server-chosen', serverInfo => {
      expect(serverInfo).toBeDefined();
    });
    speedTest.on('download-measurement', downloadData => {
      expect(downloadData.Data).toBeDefined();
      expect(downloadData.Source).toBeDefined();
    });
    speedTest.on('download-complete', downloadData => {
      expect(downloadData.LastClientMeasurement).toBeDefined();
      expect(downloadData.LastServerMeasurement).toBeDefined();
    });
    speedTest.on('upload-measurement', uploadData => {
      expect(uploadData.Data).toBeDefined();
      expect(uploadData.Source).toBeDefined();
    });
    speedTest.on('upload-complete', uploadData => {
      expect(uploadData.LastClientMeasurement).toBeDefined();
      expect(uploadData.LastServerMeasurement).toBeDefined();
    });
    speedTest.on('complete', exitCode => {
      expect(exitCode).toBe(0);
    });
    const exitCode = await speedTest.run();
    expect(exitCode).toBe(0);
  });

  test('stop', async () => {
    const speedTest = new MLabSpeedTest();
    speedTest.on('server-chosen', serverInfo => {
      expect(serverInfo).toBeDefined();
      speedTest.stop();
    });
    const exitCode = await speedTest.run();
    expect(exitCode).toBeGreaterThan(0);
  });
});
