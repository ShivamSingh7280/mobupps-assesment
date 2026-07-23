// useState
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// router
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// mui
import { Stack, TextField, Button, Alert, InputAdornment, IconButton, Typography, Link } from '@mui/material';

// mui-icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// schema
import { registerSchema } from '../../utils/validationSchemas';

// auth
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { confirmPassword, ...payload } = values;
      await registerUser(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Unable to create your account. Please try again.');
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2.5} noValidate>
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <TextField
        label="Name"
        autoComplete="name"
        fullWidth
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        fullWidth
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        fullWidth
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        autoComplete="new-password"
        fullWidth
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" color="secondary" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}
