// import * as dns from 'dns/promises';
import React, {useState, useEffect} from 'react';
import {Box, Newline, Text, useApp, useInput, useStdout} from 'ink';
import Spinner from 'ink-spinner';
import {MLabSpeedTest} from "./index";
import * as dns from "dns/promises";
import {MLabSpeedTestCommandOptions} from "./cli";

const TIME_EXPECTED = 10;

interface SpeedTestData {
  isDone: boolean;
  downloadSpeed: string;
  uploadSpeed: string;
  downloadCompleted: boolean;
  downloadProgress: number;
  downloadUnit: string;
  uploadUnit: string;
  uploadCompleted: boolean;
  uploadProgress: number;
  testServer?: string;
  latency?: string;
  latencyUnit: string;
  loss?: string;
  lossUnit: string;
}

const FixedSpacer = ({size}: { size: number }) => (
  <>{' '.repeat(size)}</>
);

const ErrorMessage = ({text}: { text: string }) => (
  <Box>
    <Text bold color="red">
      ›
      <FixedSpacer size={1}/>
    </Text>
    <Text dimColor>
      {text}
    </Text>
    <Newline count={2}/>
  </Box>
);

export const MLab = ({speedTest, options}: { speedTest: MLabSpeedTest, options: MLabSpeedTestCommandOptions }) => {
  const initialState: SpeedTestData = {
    isDone: false,
    downloadSpeed: '0',
    downloadUnit: 'Mb/s',
    downloadCompleted: false,
    downloadProgress: 0,
    uploadSpeed: '0',
    uploadUnit: 'Mb/s',
    uploadCompleted: false,
    uploadProgress: 0,
    latencyUnit: 'ms',
    lossUnit: '%'
  }
  const [data, setData] = useState(initialState);
  const [error, setError] = useState('');
  useInput(async (_, key) => {
    if (key.return) {
      setData(initialState);
      await speedTest.stop();
      setData(initialState);
      await speedTest.run();
    }
  });
  const {exit} = useApp();
  const {write} = useStdout();

  useEffect(() => {
    (async () => {
      try {
        await dns.lookup('speed.measurementlab.net');
      } catch (error) {
        // @ts-ignore
        setError((error as Error).code === 'ENOTFOUND' ?
          'Please check your internet connection' :
          `Something happened ${JSON.stringify(error)}`
        );
        exit();
        return;
      }
    })();

    speedTest.on('server-chosen', (serverInfo) => {
      setData(prevState => ({
        ...prevState,
        isDone: false,
        testServer: `${serverInfo.location.city}, ${serverInfo.location.country}`
      }));
    });
    speedTest.on('download-start', () => {
      setData(prevState => ({
        ...prevState,
        isDone: false,
        downloadSpeed: '0',
        downloadUnit: 'Mb/s'
      }));
    });
    speedTest.on('download-measurement', downloadData => {
      if (downloadData.Source === 'client') {
        setData(prevState => ({
          ...prevState,
          downloadSpeed: downloadData.Data.MeanClientMbps.toFixed(2),
          downloadProgress: (downloadData.Data.ElapsedTime > TIME_EXPECTED) ? 1.0 : downloadData.Data.ElapsedTime / TIME_EXPECTED
        }));
      }
    });
    speedTest.on('download-complete', downloadData => {
      setData(prevState => ({
        ...prevState,
        downloadSpeed: downloadData.LastClientMeasurement.MeanClientMbps.toFixed(2),
        downloadProgress: 1.0,
        downloadCompleted: true,
        latency: (downloadData.LastServerMeasurement.TCPInfo.MinRTT / 1000).toFixed(0),
        loss: (downloadData.LastServerMeasurement.TCPInfo.BytesRetrans / downloadData.LastServerMeasurement.TCPInfo.BytesSent * 100).toFixed(2)
      }));
    });
    speedTest.on('upload-start', () => {
      setData(prevState => ({
        ...prevState,
        uploadSpeed: '0',
        uploadUnit: 'Mb/s'
      }));
    });
    speedTest.on('upload-measurement', uploadData => {
      if (uploadData.Source === 'server') {
        setData(prevState => ({
          ...prevState,
          uploadSpeed: (uploadData.Data.TCPInfo.BytesReceived / uploadData.Data.TCPInfo.ElapsedTime * 8).toFixed(2)
        }));
      }
      if (uploadData.Source === 'client') {
        setData(prevState => ({
          ...prevState,
          uploadProgress: (uploadData.Data.ElapsedTime > TIME_EXPECTED) ? 1.0 : uploadData.Data.ElapsedTime / TIME_EXPECTED
        }));
      }
    });
    speedTest.on('upload-complete', uploadData => {
      setData(prevState => ({
        ...prevState,
        uploadSpeed: (uploadData.LastServerMeasurement.TCPInfo.BytesReceived / uploadData.LastServerMeasurement.TCPInfo.ElapsedTime * 8).toFixed(2),
        uploadProgress: 1.0,
        uploadCompleted: true
      }));
    });
    speedTest.on('complete', () => {
      setData(prevState => ({
        ...prevState,
        isDone: true
      }));
    });

    return () => {
      speedTest.removeAllListeners();
    }
  }, [exit]);

  if (error) {
    return <ErrorMessage text={error} />;
  }

  if (options.json) {
    write(JSON.stringify(data));
    return null;
  }

  const downloadColor = (data.downloadCompleted) ? 'green' : 'cyan';
  const uploadColor = (data.uploadCompleted) ? 'green' : 'cyan';

  return (
    <>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Test Server: {data.testServer ? '🖥 ' + data.testServer : '-'}</Text>
      </Box>
      <Box>
        {!data.isDone && (
          <>
            <Text><FixedSpacer size={2}/></Text>
            <Text color="cyan"><Spinner/></Text>
            <Text><FixedSpacer size={1}/></Text>
          </>
        )}
        {data.isDone && <Text><FixedSpacer size={4}/></Text>}
        <Text color={downloadColor}>{data.downloadSpeed} <Text dimColor>{data.downloadUnit} ↓</Text></Text>
        <Text> / </Text>
        <Text color={uploadColor}>{data.uploadSpeed} <Text dimColor>{data.uploadUnit} ↑</Text></Text>
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Latency: {data.latency ?? '-'} {data.latencyUnit}</Text>
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Loss: {data.loss ?? '- '}{data.lossUnit}</Text>
      </Box>
    </>
  );
}
