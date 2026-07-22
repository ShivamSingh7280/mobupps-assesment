import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useCategories } from '../../hooks/useCategories';

export const EMPTY_FILTERS = { category: [], stockStatus: '', minPrice: '', maxPrice: '' };

const STOCK_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

function countActiveFilters(filters) {
  let count = filters.category.length;
  if (filters.stockStatus) count += 1;
  if (filters.minPrice !== '') count += 1;
  if (filters.maxPrice !== '') count += 1;
  return count;
}

export default function FiltersPanel({ filters, onApply }) {
  const { categories } = useCategories();
  const [anchorEl, setAnchorEl] = useState(null);
  const [draft, setDraft] = useState(filters);
  const open = Boolean(anchorEl);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggleCategory = (category) => {
    setDraft((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleApply = () => {
    onApply(draft);
    setAnchorEl(null);
  };

  const handleClear = () => {
    onApply(EMPTY_FILTERS);
    setAnchorEl(null);
  };

  return (
    <>
      <Badge color="secondary" badgeContent={activeCount} invisible={activeCount === 0}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FilterListIcon />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ borderColor: 'divider', whiteSpace: 'nowrap' }}
        >
          Filters
        </Button>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ width: 300, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Category
          </Typography>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    size="small"
                    checked={draft.category.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Stock
          </Typography>
          <RadioGroup
            value={draft.stockStatus}
            onChange={(event) => setDraft((prev) => ({ ...prev, stockStatus: event.target.value }))}
          >
            {STOCK_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.label}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
              />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Price
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Min"
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              value={draft.minPrice}
              onChange={(event) => setDraft((prev) => ({ ...prev, minPrice: event.target.value }))}
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              value={draft.maxPrice}
              onChange={(event) => setDraft((prev) => ({ ...prev, maxPrice: event.target.value }))}
            />
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button color="inherit" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="contained" color="secondary" onClick={handleApply}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
