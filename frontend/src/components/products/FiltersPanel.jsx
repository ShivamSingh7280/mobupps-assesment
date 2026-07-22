import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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

// Left-nav sections, Flipkart-style: one entry per filter group, each owning
// its own panel and active-count badge. Adding a new filter in the future is
// just adding an entry here — the dialog layout doesn't change.
function useFilterSections(draft, setDraft) {
  const { categories } = useCategories();

  return [
    {
      key: 'category',
      label: 'Category',
      icon: CategoryOutlinedIcon,
      activeCount: draft.category.length,
      render: () => (
        <FormGroup>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  size="small"
                  checked={draft.category.includes(category)}
                  onChange={() =>
                    setDraft((prev) => ({
                      ...prev,
                      category: prev.category.includes(category)
                        ? prev.category.filter((c) => c !== category)
                        : [...prev.category, category],
                    }))
                  }
                />
              }
              label={category}
            />
          ))}
        </FormGroup>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      icon: Inventory2OutlinedIcon,
      activeCount: draft.stockStatus ? 1 : 0,
      render: () => (
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
      ),
    },
    {
      key: 'price',
      label: 'Price',
      icon: AttachMoneyIcon,
      activeCount: (draft.minPrice !== '' ? 1 : 0) + (draft.maxPrice !== '' ? 1 : 0),
      render: () => (
        <Stack spacing={2} sx={{ maxWidth: 280 }}>
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
      ),
    },
  ];
}

export default function FiltersPanel({ filters, onApply }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [activeSection, setActiveSection] = useState('category');
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
      setActiveSection('category');
    }
  }, [open, filters]);

  const sections = useFilterSections(draft, setDraft);
  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    onApply(EMPTY_FILTERS);
    setOpen(false);
  };

  return (
    <>
      <Badge color="secondary" badgeContent={activeCount} invisible={activeCount === 0}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FilterListIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderColor: 'divider', whiteSpace: 'nowrap' }}
        >
          Filters
        </Button>
      </Badge>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        aria-labelledby="filters-dialog-title"
      >
        <DialogTitle
          id="filters-dialog-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Filters
          <IconButton onClick={() => setOpen(false)} size="small" aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0, display: 'flex', height: { xs: '100%', sm: 420 } }}>
          <List
            disablePadding
            sx={{
              width: { xs: 112, sm: 180 },
              flexShrink: 0,
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            {sections.map((section) => {
              const Icon = section.icon;
              const selected = section.key === currentSection.key;
              return (
                <ListItemButton
                  key={section.key}
                  selected={selected}
                  onClick={() => setActiveSection(section.key)}
                  sx={{
                    alignItems: 'flex-start',
                    gap: 1,
                    py: 1.25,
                    borderLeft: '3px solid',
                    borderColor: selected ? 'secondary.main' : 'transparent',
                    bgcolor: selected ? 'background.paper' : 'transparent',
                  }}
                >
                  <Icon fontSize="small" color={selected ? 'secondary' : 'action'} sx={{ mt: '2px' }} />
                  <ListItemText
                    primary={section.label}
                    secondary={section.activeCount ? `${section.activeCount} selected` : null}
                    slotProps={{
                      primary: { variant: 'body2', fontWeight: selected ? 700 : 500 },
                      secondary: { variant: 'caption', color: 'secondary.main' },
                    }}
                    sx={{ m: 0 }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          <Box sx={{ flexGrow: 1, p: 2.5, overflowY: 'auto' }}>{currentSection.render()}</Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" color="secondary" onClick={handleApply}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
