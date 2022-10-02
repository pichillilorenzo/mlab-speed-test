import EventEmitter from "events";
import {Worker} from "worker_threads";
import path from "path";

export interface MLabSpeedTestServerDiscovery {
  loadbalancer: URL;
}

export interface MLabSpeedTestServerInfo {
  machine: string;
  location: {
    city: string;
    country: string;
  };
  urls: {
    [key: string]: string;
  };
}

export interface MLabSpeedTestDownloadStart {
  ClientStartTime: number
}

export type MLabSpeedTestMeasurement =
  MLabSpeedTestMeasurementClient
  | MLabSpeedTestMeasurementServer;

export interface MLabSpeedTestMeasurementClient {
  Source: 'client';
  Data: {
    ElapsedTime: number;
    NumBytes: number;
    MeanClientMbps: number;
  };
}

export interface MLabSpeedTestConnectionInfo {
  Client: string;
  Server: string;
  UUID: string;
}

export interface MLabSpeedTestBBRInfo {
  BW: number;
  MinRTT: number;
  PacingGain: number;
  CwndGain: number;
  ElapsedTime: number;
}

export interface MLabSpeedTestTCPInfo {
  State: number;
  CAState: number;
  Retransmits: number;
  Probes: number;
  Backoff: number;
  Options: number;
  WScale: number;
  AppLimited: number;
  RTO: number;
  ATO: number;
  SndMSS: number;
  RcvMSS: number;
  Unacked: number;
  Sacked: number;
  Lost: number;
  Retrans: number;
  Fackets: number;
  LastDataSent: number;
  LastAckSent: number;
  LastDataRecv: number;
  LastAckRecv: number;
  PMTU: number;
  RcvSsThresh: number;
  RTT: number;
  RTTVar: number;
  SndSsThresh: number;
  SndCwnd: number;
  AdvMSS: number;
  Reordering: number;
  RcvRTT: number;
  RcvSpace: number;
  TotalRetrans: number;
  PacingRate: number;
  MaxPacingRate: number;
  BytesAcked: number;
  BytesReceived: number;
  SegsOut: number;
  SegsIn: number;
  NotsentBytes: number;
  MinRTT: number;
  DataSegsIn: number;
  DataSegsOut: number;
  DeliveryRate: number;
  BusyTime: number;
  RWndLimited: number;
  SndBufLimited: number;
  Delivered: number;
  DeliveredCE: number;
  BytesSent: number;
  BytesRetrans: number;
  DSackDups: number;
  ReordSeen: number;
  RcvOooPack: number;
  SndWnd: number;
  ElapsedTime: number;
}

export interface MLabSpeedTestMeasurementServer {
  Source: 'server';
  Data: {
    ConnectionInfo: MLabSpeedTestConnectionInfo;
    BBRInfo: MLabSpeedTestBBRInfo;
    TCPInfo: MLabSpeedTestTCPInfo;
  };
}

export interface MLabSpeedTestComplete {
  LastClientMeasurement?: {
    ElapsedTime: number;
    NumBytes: number;
    MeanClientMbps: number;
  };
  LastServerMeasurement?: {
    ConnectionInfo: MLabSpeedTestConnectionInfo;
    BBRInfo: MLabSpeedTestBBRInfo;
    TCPInfo: MLabSpeedTestTCPInfo;
  };
}

export interface MLabSpeedTestUploadStart {
  StartTime: number;
  ExpectedEndTime: number;
}

export declare interface MLabSpeedTest {
  on(event: 'server-discovery', listener: (data: MLabSpeedTestServerDiscovery) => void): this;

  on(event: 'server-chosen', listener: (serverInfo: MLabSpeedTestServerInfo) => void): this;

  on(event: 'download-start', listener: (data: MLabSpeedTestDownloadStart) => void): this;

  on(event: 'download-measurement', listener: (data: MLabSpeedTestMeasurement) => void): this;

  on(event: 'download-complete', listener: (data: MLabSpeedTestComplete) => void): this;

  on(event: 'upload-start', listener: (data: MLabSpeedTestUploadStart) => void): this;

  on(event: 'upload-measurement', listener: (data: MLabSpeedTestMeasurement) => void): this;

  on(event: 'upload-complete', listener: (data: MLabSpeedTestComplete) => void): this;

  on(event: 'complete', listener: (exitCode?: number) => void): this;

  on(event: 'error', listener: (err: Error) => void): this;
}

/**
 * M-Lab's Speed Test command.
 */
export class MLabSpeedTest extends EventEmitter {
  private _running = false;
  private _worker?: Worker;

  constructor() {
    super();
  }

  /**
   * Checks if M-Lab's Speed Test is running.
   */
  get running() {
    return this._running;
  };

  /**
   * Starts the M-Lab's Speed Test.
   *
   * @return {number} Zero on success, non-zero error code on failure or `undefined` if the speed test is already running.
   */
  async run(): Promise<number | undefined> {
    if (this._running) return;
    this._running = true;

    // Because ndt7.test() returns a Promise<number> and it cannot be stopped,
    // I wrap it in a Worker, so it could be stopped using the '.terminate()' Worker method.
    this._worker = new Worker(
      __dirname.endsWith('src') ? path.join(__dirname, '..', 'lib', 'worker.js') : path.join(__dirname, 'worker.js')
    );
    return new Promise<number | undefined>((resolve, _) => {
      this._worker?.on('message', (values: [string, ...any]) => {
        const event = values[0];
        this.emit(event, ...values.slice(1));
        if (event === 'complete') {
          this._running = false;
          resolve(values[1] as number);
          return;
        }
      });
      this._worker?.on('error', (err: Error) => {
        this.emit('error', err);
      });
      this._worker?.on('exit', (code?: number) => {
        this.emit('complete', code);
        this._running = false;
        resolve(code);
      });
    });
  }

  /**
   * Stops the M-Lab's Speed Test.
   */
  async stop() {
    await this._worker?.terminate();
    this._worker = undefined;
    this._running = false;
  }
}
