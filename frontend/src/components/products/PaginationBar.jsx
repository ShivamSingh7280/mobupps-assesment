import { Pagination, Paper } from '@mui/material';

export default function PaginationBar({ page, totalPages, onChange }) {
  const disabled = totalPages <= 1;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        py: 1.5,
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 2,
      }}
    >
      <Pagination
        page={page}
        count={totalPages || 1}
        color="secondary"
        shape="rounded"
        disabled={disabled}
        onChange={(_event, value) => onChange(value)}
      />
    </Paper>
  );
}
