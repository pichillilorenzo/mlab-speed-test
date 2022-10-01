import * as puppeteer from "puppeteer";
import {Browser} from "puppeteer";
import EventEmitter from "events";

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
  LastClientMeasurement: {
    ElapsedTime: number;
    NumBytes: number;
    MeanClientMbps: number;
  };
  LastServerMeasurement: {
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
  on(event: 'server-chosen', listener: (serverInfo: MLabSpeedTestServerInfo) => void): this;
  on(event: 'download-start', listener: (data: MLabSpeedTestDownloadStart) => void): this;
  on(event: 'download-measurement', listener: (data: MLabSpeedTestMeasurement) => void): this;
  on(event: 'download-complete', listener: (data: MLabSpeedTestComplete) => void): this;
  on(event: 'upload-start', listener: (data: MLabSpeedTestUploadStart) => void): this;
  on(event: 'upload-measurement', listener: (data: MLabSpeedTestMeasurement) => void): this;
  on(event: 'upload-complete', listener: (data: MLabSpeedTestComplete) => void): this;
  on(event: 'complete', listener: () => void): this;
}

export class MLabSpeedTest extends EventEmitter {
  private browser?: Browser;
  private _running = false;

  constructor() {
    super();
  }

  get running() {
    return this._running;
  };

  async init() {
    this._running = false;
    this.browser = await puppeteer.launch();
    const page = await this.browser.newPage();
    await page.exposeFunction('onServerChosen', (serverInfo: MLabSpeedTestServerInfo) => {
      this.emit('server-chosen', serverInfo);
    });
    await page.exposeFunction('onDownloadStart', (data: MLabSpeedTestDownloadStart) => {
      this.emit('download-start', data);
    });
    await page.exposeFunction('onDownloadMeasurement', (data: MLabSpeedTestMeasurement) => {
      this.emit('download-measurement', data);
    });
    await page.exposeFunction('onDownloadComplete', (data: MLabSpeedTestComplete) => {
      this.emit('download-complete', data);
    });
    await page.exposeFunction('onUploadStart', (data: MLabSpeedTestUploadStart) => {
      this.emit('upload-start', data);
    });
    await page.exposeFunction('onUploadMeasurement', (data: MLabSpeedTestMeasurement) => {
      this.emit('upload-measurement', data);
    });
    await page.exposeFunction('onUploadComplete', (data: MLabSpeedTestComplete) => {
      this.emit('upload-complete', data);
    });
    await page.exposeFunction('onComplete', () => {
      this.emit('complete');
    });
    await page.goto('https://speed.measurementlab.net/', {
      waitUntil: 'networkidle2',
    });
  }

  run = async () => {
    if (this._running) return;
    const browser = this.browser;
    if (!browser) return;
    const page = (await browser.pages())[1];
    if (!page) return;
    this._running = true;

    await page.evaluate(async () => {
      // @ts-ignore
      await window.ndt7.test(
        {
          userAcceptedDataPolicy: true,
          uploadworkerfile: "/libraries/ndt7-upload-worker.min.js",
          downloadworkerfile: "/libraries/ndt7-download-worker.min.js"
        },
        {
          serverChosen: (server: MLabSpeedTestServerInfo) => {
            // @ts-ignore
            window.onServerChosen(server);
          },
          downloadStart: (data: MLabSpeedTestDownloadStart) => {
            // @ts-ignore
            window.onDownloadStart(data);
          },
          downloadMeasurement: (data: MLabSpeedTestMeasurement) => {
            // @ts-ignore
            window.onDownloadMeasurement(data);
          },
          downloadComplete: (data: MLabSpeedTestComplete) => {
            // @ts-ignore
            window.onDownloadComplete(data);
          },
          uploadStart: (data: MLabSpeedTestUploadStart) => {
            // @ts-ignore
            window.onUploadStart(data);
          },
          uploadMeasurement: (data: MLabSpeedTestMeasurement) => {
            // @ts-ignore
            window.onUploadMeasurement(data);
          },
          uploadComplete: (data: MLabSpeedTestComplete) => {
            // @ts-ignore
            window.onUploadComplete(data);
          },
        },
      );

      // @ts-ignore
      window.onComplete();
    }).catch(_ => {

    });

    this._running = false;
  }

  async stop() {
    const browser = this.browser;
    if (!browser) return;
    const page = (await browser.pages())[1];
    if (page) {
      await page.reload({
        waitUntil: 'networkidle2'
      });
    }
    this._running = false;
  }

  async close() {
    const browser = this.browser;
    if (!browser) return;
    await browser.close();
    this.browser = undefined;
    this._running = false;
  }
}
