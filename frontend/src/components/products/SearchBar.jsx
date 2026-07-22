import { memo } from 'react';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchBar({ value, onChange, isSearching }) {
  return (
    <TextField
      fullWidth
      placeholder="Search products by name or description…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 999,
          bgcolor: 'background.paper',
        },
      }}
      slotProps={{
        htmlInput: { 'aria-label': 'Search products by name or description' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: isSearching ? (
            <InputAdornment position="end">
              <CircularProgress size={18} color="secondary" />
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}

export default memo(SearchBar);
