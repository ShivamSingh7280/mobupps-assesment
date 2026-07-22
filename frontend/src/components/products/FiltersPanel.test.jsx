import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FiltersPanel, { EMPTY_FILTERS } from './FiltersPanel';

vi.mock('../../api/productApi', () => ({
  productApi: {
    categories: vi.fn().mockResolvedValue({ data: { data: ['Pharma', 'Food', 'Defence', 'Fashion', 'Electronics', 'Furniture'] } }),
  },
}));

function renderPanel(filters = EMPTY_FILTERS, onApply = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <FiltersPanel filters={filters} onApply={onApply} />
    </QueryClientProvider>
  );
  return { onApply };
}

describe('FiltersPanel', () => {
  it('shows no badge when no filters are active', () => {
    renderPanel();
    expect(screen.queryByText(/^[1-9]/, { selector: '.MuiBadge-badge' })).not.toBeInTheDocument();
  });

  it('shows an active filter count badge', () => {
    renderPanel({ ...EMPTY_FILTERS, category: ['Food', 'Fashion'], stockStatus: 'low_stock' });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies a category and stock selection', () => {
    const { onApply } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.click(screen.getByLabelText('Food'));
    fireEvent.click(screen.getByText('Stock'));
    fireEvent.click(screen.getByLabelText('In stock'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith({
      category: ['Food'],
      stockStatus: 'in_stock',
      minPrice: '',
      maxPrice: '',
    });
  });

  it('applies a price range', () => {
    const { onApply } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.click(screen.getByText('Price'));
    fireEvent.change(screen.getByLabelText('Min'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Max'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith({
      category: [],
      stockStatus: '',
      minPrice: '10',
      maxPrice: '50',
    });
  });

  it('clears filters back to empty', () => {
    const { onApply } = renderPanel({ ...EMPTY_FILTERS, category: ['Food'] });
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });
});
