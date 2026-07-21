import { memo } from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton, Stack, Box, Chip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton
          size="small"
          onClick={() => onEdit(product)}
          aria-label={`Edit ${product.name}`}
          sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(product)}
          aria-label={`Delete ${product.name}`}
          sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
        >
          <DeleteOutlineIcon fontSize="small" color="error" />
        </IconButton>
      </Stack>

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
            bgcolor: 'grey.100',
          }}
        >
          <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap title={product.name}>
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="h6" color="secondary.dark" fontWeight={700}>
            {currencyFormatter.format(product.price)}
          </Typography>
          <Chip
            size="small"
            label={product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            color={product.stock_quantity > 0 ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default memo(ProductCard);
