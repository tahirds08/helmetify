'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { authClient, getAvatarUrl } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const { user, checkSession } = useUser();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  const [message, setMessage] = React.useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    const [first = '', ...rest] = user?.name?.split(' ') ?? [];

    setFirstName(
      (user?.firstName as string | undefined) ?? first
    );

    setLastName(
      (user?.lastName as string | undefined) ??
        rest.join(' ')
    );
  }, [user]);

  const saveProfile = async (): Promise<void> => {
    if (
      firstName.trim().length < 2 ||
      lastName.trim().length < 2
    ) {
      setMessage({
        type: 'error',
        text: 'Please enter a first and last name of at least 2 characters.',
      });

      return;
    }

    setIsSaving(true);
    setMessage(null);

    const { error } =
      await authClient.updateProfile({
        firstName,
        lastName,
      });

    if (error) {
      setMessage({
        type: 'error',
        text: error,
      });
    } else {
      await checkSession?.();

      setMessage({
        type: 'success',
        text: 'Your profile has been saved.',
      });
    }

    setIsSaving(false);
  };

  const signOut = async (): Promise<void> => {
    await authClient.signOut();
    await checkSession?.();
    router.refresh();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Choose a JPG, PNG, or WebP image smaller than 5 MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);
    const { error } = await authClient.uploadAvatar(file);
    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      await checkSession?.();
      setMessage({ type: 'success', text: 'Your profile image has been updated.' });
    }
    setIsUploadingAvatar(false);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Settings
        </Typography>

        <Typography color="text.secondary">
          Manage your Helmetify workspace and account.
        </Typography>
      </Box>

      {/* User Profile */}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">
              User Profile
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar src={getAvatarUrl(user?.avatar)} sx={{ height: 72, width: 72 }} />
              <Button component="label" disabled={isUploadingAvatar} variant="outlined">
                {isUploadingAvatar ? 'Uploading...' : 'Upload profile image'}
                <input accept="image/jpeg,image/png,image/webp" hidden type="file" onChange={uploadAvatar} />
              </Button>
            </Stack>

            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
            />

            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
            />

            <TextField
              disabled
              fullWidth
              label="Email"
              value={user?.email ?? ''}
              helperText="Email addresses are managed by your secure account."
            />

            {message ? (
              <Alert severity={message.type}>
                {message.text}
              </Alert>
            ) : null}

            <Box>
              <Button
                variant="contained"
                disabled={isSaving || !user}
                onClick={saveProfile}
              >
                {isSaving
                  ? 'Saving...'
                  : 'Save Profile'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* AI Settings */}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">
              AI Settings
            </Typography>

            <TextField
              select
              fullWidth
              label="YOLO Model"
              defaultValue="YOLOv11n"
            >
              <MenuItem value="YOLOv11n">
                YOLOv11 Nano
              </MenuItem>

              <MenuItem value="YOLOv11s">
                YOLOv11 Small
              </MenuItem>

              <MenuItem value="YOLOv11m">
                YOLOv11 Medium
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Confidence Threshold (%)"
              type="number"
              defaultValue={70}
            />
          </Stack>
        </CardContent>
      </Card>

      <Divider />

      <Button
        color="error"
        variant="contained"
        onClick={signOut}
        sx={{ width: 'fit-content' }}
      >
        Logout
      </Button>
    </Stack>
  );
}
