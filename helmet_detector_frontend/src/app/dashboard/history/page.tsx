'use client';

import * as React from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { clearHistory, getHistory } from '@/lib/api';
import type { DetectionHistory } from '@/types/api';

export default function Page(): React.JSX.Element {
  const [rows, setRows] = React.useState<DetectionHistory[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function loadHistory() {
    try {
      const data = await getHistory();
      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadHistory();
  }, []);

  async function handleDeleteHistory() {
    try {
      setDeleting(true);

      await clearHistory();

      setRows([]);

      setOpenDialog(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Detection History
          </Typography>

          <Typography color="text.secondary">
            View all previous helmet detection records.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            {loading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ py: 6 }}
              >
                <CircularProgress />
              </Stack>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>ID</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Source</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Result</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Confidence</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Detection Time</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>

                        <TableCell>{row.source}</TableCell>

                        <TableCell>
                          <Chip
                            label={
                              row.result === 'with_helmet'
                                ? 'Helmet'
                                : 'No Helmet'
                            }
                            color={
                              row.result === 'with_helmet'
                                ? 'success'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          {row.confidence.toFixed(2)}%
                        </TableCell>

                        <TableCell>
                          {new Date(row.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loading && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No detection history found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          color="error"
          sx={{ width: 'fit-content' }}
          onClick={() => setOpenDialog(true)}
          disabled={rows.length === 0}
        >
          Clear History
        </Button>
      </Stack>

      <Dialog
        open={openDialog}
        onClose={() => !deleting && setOpenDialog(false)}
      >
        <DialogTitle>Clear Detection History</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete all detection history?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteHistory}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete History'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}