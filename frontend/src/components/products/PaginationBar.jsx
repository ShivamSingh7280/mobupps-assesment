import { Box, Button, Paper, Typography } from '@mui/material';

export default function PaginationBar({ page, totalPages, total, pageSize, onChange }) {
  const hasItems = Boolean(total);
  const rangeStart = hasItems ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = hasItems ? Math.min(page * pageSize, total) : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        py: 1.5,
        px: { xs: 2, sm: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {hasItems ? `${rangeStart}–${rangeEnd} of ${total}` : 'No results'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          {page} / {totalPages}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </Box>
    </Paper>
  );
}
