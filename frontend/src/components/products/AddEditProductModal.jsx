import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Avatar,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { productSchema } from '../../utils/validationSchemas';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';

const emptyDefaults = { name: '', description: '', price: '', stock_quantity: 0 };

export default function AddEditProductModal({ open, product, onClose, onSubmit, isSubmitting }) {
  const isEditMode = Boolean(product);
  const { upload, isUploading, error: uploadError } = useCloudinaryUpload();
  const [imagePreview, setImagePreview] = useState(null);
  const [pendingImage, setPendingImage] = useState(null); // { url, publicId } once uploaded

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock_quantity: product.stock_quantity,
          }
        : emptyDefaults
    );
    setImagePreview(product?.image_url || null);
    setPendingImage(null);
  }, [product, open, reset]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    try {
      const result = await upload(file);
      setPendingImage(result);
    } catch {
      // upload error message is already surfaced via the hook's `error` state
    }
  };

  const onFormSubmit = (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      price: Number(values.price),
      stock_quantity: Number(values.stock_quantity),
    };
    if (pendingImage) {
      payload.image_url = pendingImage.url;
      payload.image_public_id = pendingImage.publicId;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="product-dialog-title">
      <DialogTitle
        id="product-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {isEditMode ? 'Edit Product' : 'Add Product'}
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" src={imagePreview} sx={{ width: 72, height: 72, bgcolor: 'grey.100' }}>
                <Inventory2OutlinedIcon color="disabled" />
              </Avatar>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={isUploading ? <CircularProgress size={16} /> : <PhotoCameraOutlinedIcon />}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
            </Box>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Product name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price"
                    type="number"
                    fullWidth
                    inputProps={{ step: '0.01', min: 0 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
              <Controller
                name="stock_quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock quantity"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    error={!!errors.stock_quantity}
                    helperText={errors.stock_quantity?.message}
                  />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
