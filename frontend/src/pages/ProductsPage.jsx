import { useState, useCallback } from 'react';

// mui
import { Container, Box, Typography, Button, Stack } from '@mui/material';

// mui icons
import LogoutIcon from '@mui/icons-material/Logout';

// components
import SearchBar from '../components/products/SearchBar';
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

const PAGE_SIZE = 7;

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 800);

  const [modalState, setModalState] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const productsQuery = useProducts({ page, limit: PAGE_SIZE, search: debouncedSearch });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
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
  const totalPages = productsQuery.data?.meta?.totalPages || 1;

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box component="header" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container
          maxWidth="lg"
          sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" fontWeight={700}>
            Product Store
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
            </Typography>
            <Button size="small" startIcon={<LogoutIcon fontSize="small" />} onClick={logout} color="inherit">
              Log out
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4, maxWidth: 480 }}>
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            isSearching={productsQuery.isFetching} />
        </Box>

        <ProductGrid
          products={products}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          errorMessage={productsQuery.error?.message}
          searchTerm={debouncedSearch}
          onAddClick={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
          onRetry={productsQuery.refetch}
        />
      </Container>

      <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />

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
