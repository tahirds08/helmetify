'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  firstName: zod.string().trim().min(2, { message: 'Enter at least 2 characters' }).max(50),
  lastName: zod.string().trim().min(2, { message: 'Enter at least 2 characters' }).max(50),
  email: zod.string().trim().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email address' }),
  password: zod.string().min(8, { message: 'Use at least 8 characters' }).regex(/[A-Za-z]/, { message: 'Include at least one letter' }).regex(/\d/, { message: 'Include at least one number' }),
  confirmPassword: zod.string().min(1, { message: 'Please confirm your password' }),
  terms: zod.boolean().refine((value) => value, { message: 'You must accept the terms to continue' }),
}).refine((values) => values.password === values.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type Values = zod.infer<typeof schema>;
const defaultValues = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter(); const { checkSession } = useUser(); const [isPending, setIsPending] = React.useState(false);
  const { control, handleSubmit, setError, formState: { errors } } = useForm<Values>({ defaultValues, mode: 'onBlur', resolver: zodResolver(schema) });
  const onSubmit = React.useCallback(async ({ confirmPassword: _, terms: __, ...values }: Values): Promise<void> => {
    setIsPending(true);
    try { const { error } = await authClient.signUp(values); if (error) { setError('root', { type: 'server', message: error }); return; } await checkSession?.(); router.refresh(); }
    catch { setError('root', { type: 'server', message: 'Something went wrong while creating your account. Please try again.' }); }
    finally { setIsPending(false); }
  }, [checkSession, router, setError]);
  const fields: Array<{ name: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'; label: string; type?: string; autoComplete?: string }> = [
    { name: 'firstName', label: 'First name', autoComplete: 'given-name' }, { name: 'lastName', label: 'Last name', autoComplete: 'family-name' }, { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' }, { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' }, { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
  ];
  return <Stack spacing={3}><Stack spacing={1}><Typography variant="h4">Create your account</Typography><Typography color="text.secondary" variant="body2">Start using Helmetify in a few seconds.</Typography></Stack>
    <form noValidate onSubmit={handleSubmit(onSubmit)}><Stack spacing={2}>{fields.map(({ name, label, type = 'text', autoComplete }) => <Controller key={name} control={control} name={name} render={({ field }) => <FormControl error={Boolean(errors[name])}><InputLabel>{label}</InputLabel><OutlinedInput {...field} autoComplete={autoComplete} label={label} type={type} />{errors[name] ? <FormHelperText>{errors[name]?.message}</FormHelperText> : null}</FormControl>} />)}
      <Controller control={control} name="terms" render={({ field }) => <FormControl error={Boolean(errors.terms)}><FormControlLabel control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label="I agree to the terms and privacy policy" />{errors.terms ? <FormHelperText>{errors.terms.message}</FormHelperText> : null}</FormControl>} />
      {errors.root ? <Alert severity="error">{errors.root.message}</Alert> : null}<Button disabled={isPending} size="large" type="submit" variant="contained">{isPending ? 'Creating account…' : 'Create account'}</Button></Stack></form>
    <Typography color="text.secondary" variant="body2">Already have an account? <Link href={paths.auth.signIn} underline="hover" variant="subtitle2">Sign in</Link></Typography>
  </Stack>;
}
