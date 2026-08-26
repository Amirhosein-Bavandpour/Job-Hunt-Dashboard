'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button, Typography, Stack, Alert,
} from '@mui/material';
import { useLoginMutation, useRegisterMutation } from '@/features/api/apiSlice';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/store/authSlice';

interface Props {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result =
        mode === 'login'
          ? await login({ email, password }).unwrap()
          : await register({ name, email, password }).unwrap();
      dispatch(loginAction({ user: result.user, token: result.token }));
      router.push('/');
    } catch {
      setError('Something went wrong. Try again.');
    }
  };

  const busy = loggingIn || registering;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: 400, maxWidth: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="overline" color="primary">Welcome</Typography>
          <Typography variant="h4" gutterBottom>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {mode === 'register' && (
                <TextField label="Name" value={name}
                  onChange={(e) => setName(e.target.value)} fullWidth required />
              )}
              <TextField label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} fullWidth required
                inputProps={{ minLength: mode === 'register' ? 6 : undefined }} />
              <Button type="submit" variant="contained" disabled={busy || !email || !password}
                sx={{ mt: 1 }}>
                {mode === 'login' ? 'Sign In' : 'Register'}
              </Button>
              <Button onClick={() => router.push(mode === 'login' ? '/register' : '/login')}
                color="primary" sx={{ textTransform: 'none' }}>
                {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
