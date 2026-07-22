import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { PRODUCT_CATEGORIES } from '../utils/validationSchemas';

export function useCategories() {
  const query = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data } = await productApi.categories();
      return data.data;
    },
    staleTime: Infinity,
  });

  return { categories: query.data || PRODUCT_CATEGORIES, isLoading: query.isLoading };
}
