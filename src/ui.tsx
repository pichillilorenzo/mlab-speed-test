import React, {useState, useEffect} from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import Spinner from 'ink-spinner';
import {MLabSpeedTest} from "./index";
import {MLabSpeedTestCommandOptions} from "./cli";
import Link from "ink-link";
import {execSync} from "child_process";
import * as fs from "fs";
import * as dns from "dns/promises";

interface AppState {
  privacyPolicyAccepted: boolean;
  running: boolean;
  isDone: boolean;
  downloadSpeed: string;
  uploadSpeed: string;
  downloadCompleted: boolean;
  downloadProgress: number;
  downloadUnit: string;
  uploadUnit: string;
  uploadCompleted: boolean;
  uploadProgress: number;
  location?: {
    city: string;
    country: string
  };
  latency?: string;
  latencyUnit: string;
  loss?: string;
  lossUnit: string;
}

interface SpeedTestResult {
  downloadSpeed: string;
  uploadSpeed: string;
  downloadUnit: string;
  uploadUnit: string;
  location: {
    city: string;
    country: string
  };
  latency: string;
  latencyUnit: string;
  loss: string;
  lossUnit: string;
}

const TIME_EXPECTED = 10;

const isOffline = async () => {
  try {
    await dns.lookup('speed.measurementlab.net');
  } catch (err) {
    // @ts-ignore
    return (err as Error).code === 'ENOTFOUND';
  }
  return false;
}

const exportSpeedTestResults = (data: AppState) => {
  const speedTestResult: SpeedTestResult = {
    downloadSpeed: data.downloadSpeed,
    downloadUnit: data.downloadUnit,
    uploadSpeed: data.uploadSpeed,
    uploadUnit: data.uploadUnit,
    location: data.location ?? {
      city: '',
      country: ''
    },
    latency: data.latency ?? '',
    latencyUnit: data.latencyUnit,
    loss: data.loss ?? '',
    lossUnit: data.lossUnit,
  }
  let exportPath;
  switch (process.platform) {
    case 'darwin':
      exportPath = execSync(`osascript -e "tell application (path to frontmost application as text)
set exportFolder to choose file name with prompt \\"Save the MLab's Speed Test as:\\"
POSIX path of exportFolder
end"`).toString().trim();
      break;
  }
  if (exportPath) {
    fs.writeFileSync(exportPath, JSON.stringify(speedTestResult, null, '\t'));
    return;
  }
  throw new Error(`Platform ${process.platform} not supported`);
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
  </Box>
);

const initialState: AppState = {
  privacyPolicyAccepted: false,
  running: false,
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

export const MLab = ({speedTest, options}: { speedTest: MLabSpeedTest, options: MLabSpeedTestCommandOptions }) => {
  const [data, setData] = useState({
    ...initialState,
    privacyPolicyAccepted: options.acceptPrivacyPolicy,
    running: options.acceptPrivacyPolicy && options.autostart
  });
  const [fatalError, setFatalError] = useState('');
  const [error, setError] = useState('');
  const {exit} = useApp();
  useInput(async (char, key) => {
    if (fatalError) {
      if (char === 'r' && !(await isOffline())) {
        setFatalError('');
        return;
      }
    } else if (error) {
      if (char === 'b') {
        setError('');
        return;
      }
    } else {
      if (key.delete || (data.privacyPolicyAccepted && key.return)) {
        setData(prevState => ({
          ...initialState,
          privacyPolicyAccepted: prevState.privacyPolicyAccepted,
          running: false
        }));
        await speedTest.stop();
      }
      if (data.privacyPolicyAccepted && key.return) {
        setData(prevState => ({
          ...initialState,
          privacyPolicyAccepted: prevState.privacyPolicyAccepted,
          running: true
        }));
        speedTest.run();
      }
      if (key.ctrl && char === 'q') {
        await speedTest.stop();
        exit();
      }
      if (char === 'a') {
        setData(prevState => ({
          ...prevState,
          privacyPolicyAccepted: !prevState.privacyPolicyAccepted
        }));
      }
      if (data.isDone && key.ctrl && char === 's') {
        try {
          exportSpeedTestResults(data);
        } catch (e) {
          setError('JSON data cannot be exported!');
        }
      }
    }
  });

  useEffect(() => {
    speedTest.on('error', async (err: Error) => {
      setFatalError(await isOffline() ?
        'Please check your internet connection' :
        `Something happened: "${err.toString()}"`
      );
      setData(prevState => ({
        ...initialState,
        privacyPolicyAccepted: prevState.privacyPolicyAccepted,
      }));
    });
    speedTest.on('server-chosen', (serverInfo) => {
      setData(prevState => ({
        ...prevState,
        isDone: false,
        location: {...serverInfo.location}
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
        downloadSpeed: downloadData.LastClientMeasurement ? downloadData.LastClientMeasurement.MeanClientMbps.toFixed(2) : '0',
        downloadProgress: 1.0,
        downloadCompleted: true,
        latency: downloadData.LastServerMeasurement ?
          (downloadData.LastServerMeasurement.TCPInfo.MinRTT / 1000).toFixed(0) : undefined,
        loss: downloadData.LastServerMeasurement ?
          (downloadData.LastServerMeasurement.TCPInfo.BytesRetrans / downloadData.LastServerMeasurement.TCPInfo.BytesSent * 100).toFixed(2) : undefined
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
        uploadSpeed: uploadData.LastServerMeasurement ?
          (uploadData.LastServerMeasurement.TCPInfo.BytesReceived / uploadData.LastServerMeasurement.TCPInfo.ElapsedTime * 8).toFixed(2) : '0',
        uploadProgress: 1.0,
        uploadCompleted: true
      }));
    });
    speedTest.on('complete', () => {
      setData(prevState => ({
        ...prevState,
        isDone: true,
        running: false
      }));
    });

    return () => {
      speedTest.removeAllListeners();
    }
  }, [exit]);

  if (options.json) {
    if (error || fatalError) {
      return <Text>{JSON.stringify({error: error ? error : fatalError}, null, options.pretty ? '\t' : '')}</Text>;
    }
    return <Text>{JSON.stringify(data, null, options.pretty ? '\t' : '')}</Text>;
  }

  const downloadColor = data.downloadCompleted ? 'green' : 'cyan';
  const uploadColor = data.uploadCompleted ? 'green' : 'cyan';
  const checkColor = data.privacyPolicyAccepted ? 'green' : 'red';

  const actions: JSX.Element[] = [];
  if (fatalError) {
    actions.push(<Text key={'retry'}>Retry (r)</Text>);
  } else if (error) {
    actions.push(<Text key={'back'}>Go Back (b)</Text>);
  } else {
    if (data.privacyPolicyAccepted) {
      actions.push(<Text key={'run'}>{data.running ? 'Restart' : 'Run'} (enter)</Text>);
    }
    if (data.running) {
      actions.push(<Text key={'stop'}>Stop (delete)</Text>)
    }
    if (data.isDone) {
      actions.push(<Text key={'export'}>Export JSON (ctrl + s)</Text>)
    }
  }
  const actionElements: JSX.Element[] = [];
  actions.forEach((value, i) => {
    actionElements.push(...(i % 2 ? [<Text key={`sep-${i}`}> - </Text>, value] : [value]));
  })

  if (error || fatalError) {
    return <>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <ErrorMessage text={error ? error : fatalError}/>
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        {actionElements}
      </Box>
    </>;
  }

  return (
    <>
      <Box><Text><FixedSpacer size={4}/></Text></Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text bold>M-Lab's Speed Test</Text>
      </Box>
      <Box><Text><FixedSpacer size={4}/></Text></Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text color={checkColor}>{data.privacyPolicyAccepted ? '⊠' : '⌑'} </Text>
        {/* @ts-ignore */}
        <Link url="https://www.measurementlab.net/privacy/">Privacy Policy</Link>
      </Box>
      <Box><Text><FixedSpacer size={4}/></Text></Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Test Server: {data.location ? `🖥  ${data.location.city}, ${data.location.country}` : '-'}</Text>
      </Box>
      <Box>
        {data.running && (
          <>
            <Text><FixedSpacer size={2}/></Text>
            <Text color="cyan"><Spinner/></Text>
            <Text><FixedSpacer size={1}/></Text>
          </>
        )}
        {(!data.running) && <Text><FixedSpacer size={4}/></Text>}
        <Text color={downloadColor}>{data.running || data.isDone ? data.downloadSpeed : '-'} <Text
          dimColor>{data.downloadUnit} ↓</Text></Text>
        <Text> / </Text>
        <Text color={uploadColor}>{data.running || data.isDone ? data.uploadSpeed : '-'} <Text
          dimColor>{data.uploadUnit} ↑</Text></Text>
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Latency: {data.latency ?? '-'} {data.latencyUnit}</Text>
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>Loss: {data.loss ?? '- '}{data.lossUnit}</Text>
      </Box>
      <Box><Text><FixedSpacer size={4}/></Text></Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        {actionElements}
      </Box>
      <Box>
        <Text><FixedSpacer size={4}/></Text>
        <Text>{data.privacyPolicyAccepted ? 'Decline' : 'Accept'} Privacy Policy (a) - Quit (ctrl + q)</Text>
      </Box>
      <Box><Text><FixedSpacer size={4}/></Text></Box>
    </>
  );
}
