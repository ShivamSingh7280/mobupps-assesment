import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        px: 3,
      }}
    >
      <Typography variant="h2" color="text.primary">
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This page doesn&apos;t exist.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="secondary">
        Back to home
      </Button>
    </Box>
  );
}
