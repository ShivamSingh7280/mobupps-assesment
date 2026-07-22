import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useProducts({ page, limit, search, category, stockStatus, minPrice, maxPrice }) {
  const categoryParam = category?.length ? category.join(',') : undefined;

  return useQuery({
    queryKey: ['products', { page, limit, search, categoryParam, stockStatus, minPrice, maxPrice }],
    queryFn: async () => {
      const { data } = await productApi.list({
        page,
        limit,
        search: search || undefined,
        category: categoryParam,
        stockStatus: stockStatus || undefined,
        minPrice: minPrice === '' || minPrice == null ? undefined : minPrice,
        maxPrice: maxPrice === '' || maxPrice == null ? undefined : maxPrice,
      });
      return { items: data.data, meta: data.meta };
    },
    placeholderData: keepPreviousData,
  });
}
