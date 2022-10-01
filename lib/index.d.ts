/// <reference types="node" />
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
    ClientStartTime: number;
}
export declare type MLabSpeedTestMeasurement = MLabSpeedTestMeasurementClient | MLabSpeedTestMeasurementServer;
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
export declare class MLabSpeedTest extends EventEmitter {
    private browser?;
    private _running;
    constructor();
    get running(): boolean;
    init(): Promise<void>;
    run: () => Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
}
