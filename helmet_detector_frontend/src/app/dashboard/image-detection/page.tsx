'use client';

import * as React from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';

import { UploadSimple as UploadIcon } from '@phosphor-icons/react';

import { uploadImage } from '@/lib/api';
import type { ImageDetectionResponse } from '@/types/api';

export default function Page(): React.JSX.Element {
  const [image, setImage] = React.useState<string | null>(null);
  const [result, setResult] =
    React.useState<ImageDetectionResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);

    // Reset previous state
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await uploadImage(file);

      setResult(response);
    } catch (error_) {
      console.error('Image detection error:', error_);

      setError('Detection failed. Please try again.');
    } finally {
      setLoading(false);

      // Allow selecting the same file again
      event.target.value = '';
    }
  }

  const prediction = result?.prediction;

  const detectedResult = prediction?.result ?? null;
  const confidence = prediction?.confidence ?? 0;

  const isHelmet =
    detectedResult === 'with_helmet';

  const isNoHelmet =
    detectedResult === 'without_helmet';

  const hasDetection =
    isHelmet || isNoHelmet;

  return (
    <Stack spacing={4}>

      {/* PAGE HEADER */}

      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Helmet Detection
        </Typography>

        <Typography color="text.secondary">
          Upload an image to detect helmets using AI.
        </Typography>
      </Box>


      {/* MAIN CARD */}

      <Card>
        <CardContent>

          <Stack spacing={3}>

            {/* UPLOAD BUTTON */}

            <Button
              component="label"
              variant="contained"
              startIcon={<UploadIcon size={20} />}
              disabled={loading}
              sx={{
                width: 'fit-content',
              }}
            >
              {loading ? 'Processing...' : 'Upload Image'}

              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImage}
              />
            </Button>


            {/* ERROR */}

            {error && (
              <Card
                variant="outlined"
                sx={{
                  borderColor: 'error.main',
                  bgcolor: 'error.lighter',
                }}
              >
                <CardContent>
                  <Typography color="error">
                    {error}
                  </Typography>
                </CardContent>
              </Card>
            )}


            {/* IMAGE + RESULT */}

            {image && (
              <Grid container spacing={3}>

                {/* UPLOADED IMAGE */}

                <Grid size={{ xs: 12, md: 7 }}>

                  <Card variant="outlined">

                    <CardContent>

                      <Typography
                        variant="h6"
                        sx={{ mb: 2 }}
                      >
                        Uploaded Image
                      </Typography>

                      <Box
                        component="img"
                        src={image}
                        alt="Uploaded helmet detection image"
                        sx={{
                          width: '100%',
                          maxHeight: 600,
                          objectFit: 'contain',
                          borderRadius: 2,
                          display: 'block',
                        }}
                      />

                    </CardContent>

                  </Card>

                </Grid>


                {/* DETECTION RESULT */}

                <Grid size={{ xs: 12, md: 5 }}>

                  <Card variant="outlined">

                    <CardContent>

                      <Stack spacing={2}>

                        <Typography variant="h6">
                          Detection Result
                        </Typography>


                        {/* PROCESSING */}

                        {loading && (
                          <Stack
                            spacing={2}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ py: 6 }}
                          >

                            <CircularProgress />

                            <Typography>
                              Running AI Model...
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              🔄 Analyzing image... Please wait.
                            </Typography>

                          </Stack>
                        )}


                        {/* ERROR */}

                        {!loading && error && (
                          <Stack spacing={2}>

                            <Chip
                              color="error"
                              label="Detection Failed"
                              sx={{
                                width: 'fit-content',
                              }}
                            />

                            <Typography
                              color="text.secondary"
                            >
                              {error}
                            </Typography>

                          </Stack>
                        )}


                        {/* SUCCESSFUL DETECTION */}

                        {!loading &&
                          !error &&
                          result &&
                          hasDetection && (
                            <Stack spacing={2}>

                              <Chip
                                color={
                                  isHelmet
                                    ? 'success'
                                    : 'error'
                                }
                                label={
                                  isHelmet
                                    ? 'Helmet Detected'
                                    : 'No Helmet'
                                }
                                sx={{
                                  width: 'fit-content',
                                }}
                              />

                              <Divider />

                              <Typography>
                                <strong>Result:</strong>{' '}
                                {detectedResult}
                              </Typography>

                              <Typography>
                                <strong>
                                  Confidence:
                                </strong>{' '}
                                {confidence.toFixed(2)}%
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Detection completed successfully.
                              </Typography>

                            </Stack>
                          )}


                        {/* UNKNOWN RESULT */}

                        {!loading &&
                          !error &&
                          result &&
                          !hasDetection && (
                            <Stack spacing={2}>

                              <Chip
                                color="warning"
                                label="No Detection"
                                sx={{
                                  width: 'fit-content',
                                }}
                              />

                              <Divider />

                              <Typography>
                                No helmet-related object was
                                detected.
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Model result:{' '}
                                {detectedResult || 'unknown'}
                              </Typography>

                            </Stack>
                          )}


                        {/* INITIAL STATE */}

                        {!loading &&
                          !error &&
                          !result && (
                            <Stack spacing={2}>

                              <Chip
                                color="warning"
                                label="Waiting for AI"
                                sx={{
                                  width: 'fit-content',
                                }}
                              />

                              <Typography
                                color="text.secondary"
                              >
                                Upload an image to start
                                helmet detection.
                              </Typography>

                            </Stack>
                          )}

                      </Stack>

                    </CardContent>

                  </Card>

                </Grid>

              </Grid>
            )}


            {/* NO IMAGE */}

            {!image && (
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

                  <UploadIcon
                    size={60}
                    weight="duotone"
                  />

                  <Typography variant="h6">
                    No Image Selected
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Upload an image to preview it and
                    start helmet detection.
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