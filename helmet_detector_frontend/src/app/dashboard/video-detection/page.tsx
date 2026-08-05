'use client';

import * as React from 'react';
import { uploadVideo } from '@/lib/api';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import {
  UploadSimple,
  PlayCircle,
  VideoCamera,
} from '@phosphor-icons/react';

export default function Page(): React.JSX.Element {
  const [video, setVideo] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [prediction, setPrediction] = React.useState<any>(null);

  function handleVideo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setVideo(URL.createObjectURL(file));
    setPrediction(null);
  }

  async function handleDetectVideo() {
    if (!selectedFile) return;

    try {
      setProcessing(true);

      const response = await uploadVideo(selectedFile);

      setPrediction(response.prediction);
    } catch (error) {
      console.error(error);
      alert('Video detection failed.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Video Helmet Detection
        </Typography>

        <Typography color="text.secondary">
          Upload a video and detect helmets using AI.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadSimple size={20} />}
              sx={{ width: 'fit-content' }}
            >
              Upload Video

              <input
                hidden
                type="file"
                accept="video/*"
                onChange={handleVideo}
              />
            </Button>

            {video && (
              <Grid container spacing={3}>
                {/* Uploaded Video */}

                <Grid size={{ xs: 12, md: 7 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Uploaded Video
                      </Typography>

                      <Box
                        component="video"
                        controls
                        src={video}
                        sx={{
                          width: '100%',
                          borderRadius: 2,
                        }}
                      />

                      {prediction && (
                        <>
                          <Typography
                            variant="h6"
                            sx={{ mt: 3, mb: 2 }}
                          >
                            Processed Video
                          </Typography>

                          <Box
                            component="video"
                            controls
                            src={`http://127.0.0.1:8000/${prediction.annotated_video}`}
                            sx={{
                              width: '100%',
                              borderRadius: 2,
                            }}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detection Result */}

                <Grid size={{ xs: 12, md: 5 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6">
                          Detection Result
                        </Typography>

                        <Chip
                          color={
                            prediction
                              ? prediction.result === 'with_helmet'
                                ? 'success'
                                : 'error'
                              : 'warning'
                          }
                          label={
                            prediction
                              ? prediction.result === 'with_helmet'
                                ? 'Helmet Detected'
                                : 'No Helmet Detected'
                              : 'Waiting for AI'
                          }
                          sx={{ width: 'fit-content' }}
                        />

                        <Divider />

                        <Typography>
                          Result:{' '}
                          <strong>
                            {prediction
                              ? prediction.result
                              : '--'}
                          </strong>
                        </Typography>

                        <Typography>
                          Confidence:{' '}
                          <strong>
                            {prediction
                              ? `${prediction.confidence}%`
                              : '--'}
                          </strong>
                        </Typography>

                        <Typography>
                          Status:{' '}
                          <strong>
                            {processing
                              ? 'Processing...'
                              : prediction
                                ? 'Completed'
                                : 'Waiting'}
                          </strong>
                        </Typography>

                        <Divider />

                        <Typography variant="body2">
                          Processing Progress
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={
                            processing
                              ? 60
                              : prediction
                                ? 100
                                : 0
                          }
                        />

                        <Button
                          variant="contained"
                          startIcon={<PlayCircle size={20} />}
                          disabled={
                            !selectedFile || processing
                          }
                          onClick={handleDetectVideo}
                        >
                          {processing
                            ? 'Processing...'
                            : 'Detect Video'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {!video && (
              <Card
                variant="outlined"
                sx={{
                  py: 8,
                  textAlign: 'center',
                }}
              >
                <Stack
                  spacing={2}
                  alignItems="center"
                >
                  <VideoCamera size={60} />

                  <Typography variant="h6">
                    No Video Selected
                  </Typography>

                  <Typography color="text.secondary">
                    Upload a video to preview it and start
                    helmet detection.
                  </Typography>
                </Stack>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}