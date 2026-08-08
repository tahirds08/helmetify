'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import RouterLink from 'next/link';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

const schema = zod.object({
  email: zod
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Enter a valid email address' }),

  password: zod
    .string()
    .min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  email: '',
  password: '',
};

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      try {
        const { error } =
          await authClient.signInWithPassword(values);

        if (error) {
          setError('root', {
            type: 'server',
            message: error,
          });

          return;
        }

        await checkSession?.();

        router.refresh();
      } catch {
        setError('root', {
          type: 'server',
          message:
            'Something went wrong while signing in. Please try again.',
        });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">
          Welcome back
        </Typography>

        <Typography
          color="text.secondary"
          variant="body2"
        >
          Sign in to continue protecting every ride.
        </Typography>
      </Stack>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl
                error={Boolean(errors.email)}
              >
                <InputLabel>
                  Email address
                </InputLabel>

                <OutlinedInput
                  {...field}
                  autoComplete="email"
                  label="Email address"
                  type="email"
                />

                {errors.email ? (
                  <FormHelperText>
                    {errors.email.message}
                  </FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl
                error={Boolean(errors.password)}
              >
                <InputLabel>
                  Password
                </InputLabel>

                <OutlinedInput
                  {...field}
                  autoComplete="current-password"
                  label="Password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                      >
                        {showPassword ? (
                          <EyeSlashIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />

                {errors.password ? (
                  <FormHelperText>
                    {errors.password.message}
                  </FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {errors.root ? (
            <Alert severity="error">
              {errors.root.message}
            </Alert>
          ) : null}

          <Button
            disabled={isPending}
            size="large"
            type="submit"
            variant="contained"
          >
            {isPending
              ? 'Signing in…'
              : 'Sign in'}
          </Button>
        </Stack>
      </form>

      <Typography
        color="text.secondary"
        variant="body2"
      >
        New to Helmetify?{' '}
        <Link href={paths.auth.signUp} underline="hover" variant="subtitle2">Create an account</Link>
      </Typography>
    </Stack>
  );
}