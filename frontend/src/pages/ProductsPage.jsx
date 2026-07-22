import { useState, useCallback } from 'react';

// mui
import { Container, Box, Typography, Button, Stack } from '@mui/material';

// mui icons
import AddIcon from '@mui/icons-material/Add';

// theme
import { serifFontFamily } from '../theme/theme';

// components
import SearchBar from '../components/products/SearchBar';
import FiltersPanel, { EMPTY_FILTERS } from '../components/products/FiltersPanel';
import ProductGrid from '../components/products/ProductGrid';
import PaginationBar from '../components/products/PaginationBar';
import AddEditProductModal from '../components/products/AddEditProductModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

// custom hooks
import { useDebounce } from '../hooks/useDebounce';
import { useProducts } from '../hooks/useProducts';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProductMutations';

// toaster
import { useToast } from '../components/common/ToastProvider';

// auth
import { useAuth } from '../hooks/useAuth';

const PAGE_SIZE = 6;

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 800);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [modalState, setModalState] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const productsQuery = useProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    category: filters.category,
    stockStatus: filters.stockStatus,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleFiltersApply = useCallback((nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  }, []);

  const handleOpenCreate = useCallback(() => setModalState({ open: true, product: null }), []);
  const handleOpenEdit = useCallback((product) => setModalState({ open: true, product }), []);
  const handleCloseModal = useCallback(() => setModalState({ open: false, product: null }), []);

  const handleSubmitProduct = async (payload) => {
    try {
      if (modalState.product) {
        await updateMutation.mutateAsync({ id: modalState.product.id, payload });
        showToast('Product updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Product added successfully');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('Product deleted');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleCancelDelete = useCallback(() => setDeleteTarget(null), []);

  const products = productsQuery.data?.items || [];
  const meta = productsQuery.data?.meta;
  const totalPages = meta?.totalPages || 1;
  // react-query's keepPreviousData shows the old page's items while the new
  // page fetches (avoids flicker on search), but a page change should read
  // as a fresh load, not stale cards sitting there — so treat it as loading
  // whenever the in-flight fetch doesn't yet match the page we asked for.
  const isPageChanging = productsQuery.isFetching && meta?.page !== page;

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h6" sx={{ fontFamily: serifFontFamily, fontWeight: 700 }}>
              Ledger
            </Typography>
            <Typography
              variant="caption"
              color="secondary.main"
              sx={{ fontWeight: 700, letterSpacing: 2 }}
            >
              CATALOG
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
            </Typography>
            <Button variant="outlined" color="inherit" onClick={logout} sx={{ borderColor: 'divider' }}>
              Log out
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ flexGrow: 1 }}>
            <SearchBar
              value={searchInput}
              onChange={handleSearchChange}
              isSearching={productsQuery.isFetching} />
          </Box>
          <FiltersPanel filters={filters} onApply={handleFiltersApply} />
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ whiteSpace: 'nowrap', px: 3 }}
          >
            Add product
          </Button>
        </Stack>

        <ProductGrid
          products={products}
          isLoading={productsQuery.isLoading || isPageChanging}
          isError={productsQuery.isError}
          errorMessage={productsQuery.error?.message}
          searchTerm={debouncedSearch}
          hasActiveFilters={
            filters.category.length > 0 || Boolean(filters.stockStatus) || filters.minPrice !== '' || filters.maxPrice !== ''
          }
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
          onRetry={productsQuery.refetch}
        />
      </Container>

      <PaginationBar page={page} totalPages={totalPages} total={meta?.total} pageSize={PAGE_SIZE} onChange={setPage} />

      <AddEditProductModal
        open={modalState.open}
        product={modalState.product}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduct}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        description={
          deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This can't be undone.` : ''
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}
