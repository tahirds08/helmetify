'use client';

import * as React from 'react';

import { uploadCameraFrame } from '@/lib/api';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import {
  Play,
  Stop,
} from '@phosphor-icons/react';

export default function Page(): React.JSX.Element {
  const [running, setRunning] = React.useState(false);
  const [prediction, setPrediction] = React.useState<any>(null);
  const [framesProcessed, setFramesProcessed] = React.useState(0);
  const [helmetCount, setHelmetCount] = React.useState(0);
  const [noHelmetCount, setNoHelmetCount] = React.useState(0);
  const [processing, setProcessing] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const intervalRef =
    React.useRef<ReturnType<typeof setInterval> | null>(null);

  const processingRef = React.useRef(false);

  // ============================================================
  // CAPTURE FRAME
  // ============================================================

  const captureFrame = React.useCallback(
    async (): Promise<void> => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        return;
      }

      if (processingRef.current) {
        return;
      }

      /*
       * Make sure the webcam has produced
       * an actual frame.
       */
      if (
        video.readyState < video.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      processingRef.current = true;
      setProcessing(true);

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');

        if (!context) {
          return;
        }

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const blob = await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              'image/jpeg',
              0.85
            );
          }
        );

        if (!blob) {
          return;
        }

        const file = new File(
          [blob],
          'camera-frame.jpg',
          {
            type: 'image/jpeg',
          }
        );

        const response =
          await uploadCameraFrame(file);

        const result = response?.prediction;

        if (!result) {
          return;
        }

        setPrediction(result);

        setFramesProcessed(
          (previous) => previous + 1
        );

        if (result.result === 'with_helmet') {
          setHelmetCount(
            (previous) => previous + 1
          );
        }

        if (
          result.result === 'without_helmet'
        ) {
          setNoHelmetCount(
            (previous) => previous + 1
          );
        }
      } catch (error) {
        console.error(
          'Camera frame detection failed:',
          error
        );
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    },
    []
  );

  // ============================================================
  // START CAMERA
  // ============================================================

  async function startCamera(): Promise<void> {
    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert(
          'Camera access is not supported by this browser.'
        );
        return;
      }

      const video = videoRef.current;

      if (!video) {
        alert(
          'Camera preview is not available.'
        );
        return;
      }

      /*
       * Ask browser for webcam access.
       */
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
          audio: false,
        });

      streamRef.current = stream;

      /*
       * Attach webcam stream to video element.
       */
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      /*
       * Wait until webcam metadata is available.
       */
      if (
        video.readyState <
        video.HAVE_METADATA
      ) {
        await new Promise<void>((resolve) => {
          const handleMetadata = () => {
            video.removeEventListener(
              'loadedmetadata',
              handleMetadata
            );

            resolve();
          };

          video.addEventListener(
            'loadedmetadata',
            handleMetadata
          );
        });
      }

      /*
       * Start displaying webcam.
       */
      await video.play();

      /*
       * Reset statistics.
       */
      setPrediction(null);
      setFramesProcessed(0);
      setHelmetCount(0);
      setNoHelmetCount(0);

      setRunning(true);

      /*
       * Give the webcam a short moment
       * to produce a proper frame.
       */
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 500);
      });

      /*
       * Process first frame.
       */
      await captureFrame();

      /*
       * Process one frame every 5 seconds.
       */
      intervalRef.current = setInterval(() => {
        void captureFrame();
      }, 5000);
    } catch (error) {
      console.error(
        'Unable to access camera:',
        error
      );

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setRunning(false);

      alert(
        'Unable to access camera. Please allow camera permission and try again.'
      );
    }
  }

  // ============================================================
  // STOP CAMERA
  // ============================================================

  function stopCamera(): void {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current !== null) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    processingRef.current = false;

    setRunning(false);
    setProcessing(false);
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  React.useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current !== null) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Live Camera Detection
        </Typography>

        <Typography color="text.secondary">
          Monitor your webcam and analyze one
          frame every 5 seconds.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* CAMERA */}

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Live Camera Feed
                </Typography>

                <Box
                  sx={{
                    height: 450,
                    borderRadius: 2,
                    bgcolor: '#111827',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: running
                        ? 'block'
                        : 'none',
                    }}
                  />

                  {!running && (
                    <Stack
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography
                        color="grey.500"
                        variant="h6"
                      >
                        Camera Stopped
                      </Typography>

                      <Typography
                        color="grey.600"
                        variant="body2"
                      >
                        Click Start Camera to begin
                      </Typography>
                    </Stack>
                  )}

                  <canvas
                    ref={canvasRef}
                    style={{
                      display: 'none',
                    }}
                  />
                </Box>

                <Stack
                  direction="row"
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    startIcon={
                      <Play size={18} />
                    }
                    disabled={running}
                    onClick={() => {
                      void startCamera();
                    }}
                  >
                    Start Camera
                  </Button>

                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={
                      <Stop size={18} />
                    }
                    disabled={!running}
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </Button>
                </Stack>

                {running && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {processing
                      ? 'Analyzing captured frame...'
                      : 'Camera active. A new frame will be analyzed every 5 seconds.'}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* STATUS */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Live Status
                </Typography>

                <Chip
                  color={
                    running
                      ? 'success'
                      : 'default'
                  }
                  label={
                    running
                      ? 'Camera Running'
                      : 'Camera Stopped'
                  }
                  sx={{
                    width: 'fit-content',
                  }}
                />

                <Divider />

                <Typography>
                  Frames Processed:{' '}
                  <strong>
                    {framesProcessed}
                  </strong>
                </Typography>

                <Typography>
                  Helmet:{' '}
                  <strong>
                    {helmetCount}
                  </strong>
                </Typography>

                <Typography>
                  No Helmet:{' '}
                  <strong>
                    {noHelmetCount}
                  </strong>
                </Typography>

                <Typography>
                  Current Result:{' '}
                  <strong>
                    {prediction?.result ??
                      '--'}
                  </strong>
                </Typography>

                <Typography>
                  Confidence:{' '}
                  <strong>
                    {prediction?.confidence !==
                    undefined
                      ? `${prediction.confidence}%`
                      : '--'}
                  </strong>
                </Typography>

                <Divider />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Detection interval
                </Typography>

                <Chip
                  label="1 frame every 5 seconds"
                  color="primary"
                  variant="outlined"
                  sx={{
                    width: 'fit-content',
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}