import {
  MLabSpeedTestComplete,
  MLabSpeedTestDownloadStart,
  MLabSpeedTestMeasurement,
  MLabSpeedTestServerDiscovery,
  MLabSpeedTestServerInfo, MLabSpeedTestUploadStart
} from "./index";
import {isMainThread, parentPort} from "worker_threads";

if (!isMainThread) {
  // Hide all node warnings, such as Fetch API warning, because it breaks the Ink React UI.
  const originalEmit = process.emit;
  // @ts-expect-error - TS complains about the return type of originalEmit.apply
  process.emit = function (name, data: any, ...args) {
    if (name === `warning`) return false;
    return originalEmit.apply(process, arguments as unknown as Parameters<typeof process.emit>);
  };
  // @ts-expect-error - TS complains about the return type of originalEmitWarning.apply
  process.emitWarning = function (name, data: any, ...args) {
    return false;
  };

  const ndt7 = require('@m-lab/ndt7');
  ndt7.test(
    {
      userAcceptedDataPolicy: true,
    },
    {
      serverDiscovery: (data: MLabSpeedTestServerDiscovery) => {
        parentPort?.postMessage(['server-discovery', data]);
      },
      serverChosen: (serverInfo: MLabSpeedTestServerInfo) => {
        parentPort?.postMessage(['server-chosen', serverInfo]);
      },
      downloadStart: (data: MLabSpeedTestDownloadStart) => {
        parentPort?.postMessage(['download-start', data]);
      },
      downloadMeasurement: (data: MLabSpeedTestMeasurement) => {
        parentPort?.postMessage(['download-measurement', data]);
      },
      downloadComplete: (data: MLabSpeedTestComplete) => {
        parentPort?.postMessage(['download-complete', data]);
      },
      uploadStart: (data: MLabSpeedTestUploadStart) => {
        parentPort?.postMessage(['upload-start', data]);
      },
      uploadMeasurement: (data: MLabSpeedTestMeasurement) => {
        parentPort?.postMessage(['upload-measurement', data]);
      },
      uploadComplete: (data: MLabSpeedTestComplete) => {
        parentPort?.postMessage(['upload-complete', data]);
      },
      error: (err: Error) => {
        parentPort?.postMessage(['error', err]);
      }
    },
  ).then((exitCode: number) => {
    parentPort?.postMessage(['complete', exitCode]);
  })
}
