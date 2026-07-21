import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useProducts({ page, limit, search }) {
  return useQuery({
    queryKey: ['products', { page, limit, search }],
    queryFn: async () => {
      const { data } = await productApi.list({ page, limit, search: search || undefined });
      return { items: data.data, meta: data.meta };
    },
    placeholderData: keepPreviousData,
  });
}
