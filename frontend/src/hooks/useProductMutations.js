import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['products'] });
      previousQueries.forEach(([key, cached]) => {
        if (!cached) return;
        queryClient.setQueryData(key, {
          ...cached,
          items: cached.items.filter((product) => product.id !== id),
        });
      });
      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      context?.previousQueries?.forEach(([key, cached]) => {
        queryClient.setQueryData(key, cached);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
