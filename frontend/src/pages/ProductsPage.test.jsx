import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/common/ToastProvider';
import ProductsPage from './ProductsPage';

const API_BASE = 'http://localhost:5000/api/v1';

const initialProducts = [
  { id: '1', name: 'Nike Air Max 270', description: 'Comfortable sneaker', price: 139.99, stock_quantity: 12, image_url: null },
  { id: '2', name: 'Classic Wallet', description: 'Leather wallet', price: 29.5, stock_quantity: 0, image_url: null },
];

let products = [...initialProducts];

const server = setupServer(
  http.post(`${API_BASE}/auth/refresh`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'fake-token' } })
  ),
  http.get(`${API_BASE}/auth/me`, () =>
    HttpResponse.json({ success: true, data: { user: { id: 'u1', name: 'Test User', email: 'test@example.com' } } })
  ),
  http.get(`${API_BASE}/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const filtered = search ? products.filter((p) => p.name.toLowerCase().includes(search)) : products;
    return HttpResponse.json({
      success: true,
      data: filtered,
      meta: { page: 1, limit: 12, total: filtered.length, totalPages: 1 },
    });
  }),
  http.post(`${API_BASE}/products`, async ({ request }) => {
    const body = await request.json();
    const newProduct = { id: String(products.length + 1), ...body };
    products = [newProduct, ...products];
    return HttpResponse.json({ success: true, data: newProduct }, { status: 201 });
  })
);

function renderProductsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <ProductsPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  products = [...initialProducts];
});
afterAll(() => server.close());

describe('ProductsPage', () => {
  it('loads and displays the product list', async () => {
    renderProductsPage();
    expect(await screen.findByText('Nike Air Max 270')).toBeInTheDocument();
    expect(screen.getByText('Classic Wallet')).toBeInTheDocument();
  });

  it('filters the list when searching (debounced)', async () => {
    renderProductsPage();
    await screen.findByText('Nike Air Max 270');

    fireEvent.change(screen.getByRole('textbox', { name: /search products/i }), {
      target: { value: 'wallet' },
    });

    await waitFor(() => expect(screen.queryByText('Nike Air Max 270')).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('Classic Wallet')).toBeInTheDocument();
  });

  it('shows an empty state for a search with no matches', async () => {
    renderProductsPage();
    await screen.findByText('Nike Air Max 270');

    fireEvent.change(screen.getByRole('textbox', { name: /search products/i }), {
      target: { value: 'zzz-no-match' },
    });

    expect(await screen.findByText('No products found for "zzz-no-match".', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('adds a new product through the modal and shows a success toast', async () => {
    renderProductsPage();
    await screen.findByText('Nike Air Max 270');

    fireEvent.click(screen.getByText('Add Product'));
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText(/product name/i), { target: { value: 'Test Sneaker' } });
    fireEvent.change(within(dialog).getByLabelText(/^price/i), { target: { value: '59.99' } });
    fireEvent.change(within(dialog).getByLabelText(/stock quantity/i), { target: { value: '5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add product' }));

    expect(await screen.findByText('Product added successfully')).toBeInTheDocument();
    expect(await screen.findByText('Test Sneaker')).toBeInTheDocument();
  });

  it('shows a validation error instead of submitting an incomplete form', async () => {
    renderProductsPage();
    await screen.findByText('Nike Air Max 270');

    fireEvent.click(screen.getByText('Add Product'));
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Add product' }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
  });
});
