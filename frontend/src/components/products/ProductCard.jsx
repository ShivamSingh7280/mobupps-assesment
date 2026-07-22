import { memo, useState } from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton, Box, Chip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { monoFontFamily, serifFontFamily } from '../../theme/theme';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const LOW_STOCK_THRESHOLD = 5;

const DEFAULT_PLACEHOLDER = { bg: '#E1E7F0', fg: '#334E7A' };

const CATEGORY_STYLES = {
  Pharma: { bg: '#E1E7F0', fg: '#334E7A' },
  Food: { bg: '#DCEEE6', fg: '#0F766E' },
  Defence: { bg: '#E7E5DA', fg: '#4B5320' },
  Fashion: { bg: '#FBE2EE', fg: '#9D174D' },
  Electronics: { bg: '#E0E7FF', fg: '#3730A3' },
  Furniture: { bg: '#F3E4C5', fg: '#92400E' },
};

function stockChipProps(stock) {
  if (stock <= 0) {
    return { label: 'Out of stock', bg: '#FBE2E2', fg: '#B42318' };
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: `${stock} left`, bg: '#FBE2E2', fg: '#B42318' };
  }
  return { label: `${stock} in stock`, bg: '#DCF3E5', fg: '#1A7F4E' };
}

function ProductCard({ product, onEdit, onDelete }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const placeholder = CATEGORY_STYLES[product.category] || DEFAULT_PLACEHOLDER;
  const chip = stockChipProps(product.stock_quantity);

  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleEdit = () => {
    handleMenuClose();
    onEdit(product);
  };
  const handleDelete = () => {
    handleMenuClose();
    onDelete(product);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
      }}
    >
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        aria-label={`Actions for ${product.name}`}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit} aria-label={`Edit ${product.name}`}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} aria-label={`Delete ${product.name}`}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Box sx={{ position: 'relative' }}>
        {product.category && (
          <Chip
            label={product.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
              bgcolor: 'rgba(15, 23, 42, 0.72)',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
          />
        )}
        {product.image_url ? (
          <CardMedia
            component="img"
            height={180}
            image={product.image_url}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: placeholder.bg,
              color: placeholder.fg,
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 40 }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontFamily: serifFontFamily, fontWeight: 700 }}
          noWrap
          title={product.name}
        >
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Typography sx={{ fontFamily: monoFontFamily, fontWeight: 700 }} variant="subtitle1">
            {currencyFormatter.format(product.price)}
          </Typography>
          <Chip
            size="small"
            label={chip.label}
            sx={{ bgcolor: chip.bg, color: chip.fg, fontWeight: 600 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(ProductCard);
