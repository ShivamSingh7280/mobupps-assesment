import { useState } from 'react';
import { Box, MenuItem, Pagination, Paper, Stack, TextField, Typography } from '@mui/material';

const PAGE_SIZE_OPTIONS = [6, 12, 18, 24, 30];

export default function PaginationBar({ page, totalPages, total, pageSize, onChange, onPageSizeChange }) {
  const hasItems = Boolean(total);
  const rangeStart = hasItems ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = hasItems ? Math.min(page * pageSize, total) : 0;

  const [jumpValue, setJumpValue] = useState('');

  const commitJump = () => {
    const parsed = Number(jumpValue);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages && parsed !== page) {
      onChange(parsed);
    }
    setJumpValue('');
  };

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
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        borderRadius: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {hasItems ? `${rangeStart}–${rangeEnd} of ${total}` : 'No results'}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField
          select
          size="small"
          variant="outlined"
          label="Per page"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          sx={{ width: 110 }}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option} Products
            </MenuItem>
          ))}
        </TextField>

        <Pagination
          page={page}
          count={totalPages}
          onChange={(event, value) => onChange(value)}
          color="secondary"
          shape="rounded"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />

        <Box component="form" onSubmit={(event) => { event.preventDefault(); commitJump(); }}>
          <TextField
            size="small"
            type="number"
            variant="outlined"
            placeholder="Go to"
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            onBlur={commitJump}
            slotProps={{ htmlInput: { min: 1, max: totalPages, 'aria-label': 'Jump to page' } }}
            sx={{ width: 90 }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
