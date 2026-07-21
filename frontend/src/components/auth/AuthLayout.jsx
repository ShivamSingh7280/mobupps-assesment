import { Box, Paper, Typography } from '@mui/material';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          {subtitle}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
