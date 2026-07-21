import { Grid, Box, Typography } from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import ProductCard from './ProductCard';
import AddProductCard from './AddProductCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';

const SKELETON_COUNT = 7;

export default function ProductGrid({
  products,
  isLoading,
  isError,
  errorMessage,
  searchTerm,
  onAddClick,
  onEdit,
  onDelete,
  onRetry,
}) {
  if (isError) {
    return (
      <EmptyState
        title="Something went wrong"
        description={errorMessage || 'Failed to load products. Please try again.'}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AddProductCard onClick={onAddClick} />
      </Grid>

      {isLoading &&
        Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <LoadingSkeleton />
          </Grid>
        ))}

      {!isLoading &&
        products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
          </Grid>
        ))}

      {!isLoading && products.length === 0 && (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SearchOffOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? `No products found for "${searchTerm}".` : 'No products yet — add your first one!'}
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
