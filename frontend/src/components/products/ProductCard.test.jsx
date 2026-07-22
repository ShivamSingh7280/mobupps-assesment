import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

const product = {
  id: 'p1',
  name: 'Nike Air Max 270',
  description: 'Comfortable everyday sneaker',
  price: 139.99,
  stock_quantity: 12,
  image_url: null,
};

function openMenu(product) {
  fireEvent.click(screen.getByLabelText(`Actions for ${product.name}`));
}

describe('ProductCard', () => {
  it('renders name, formatted price, and stock chip', () => {
    render(<ProductCard product={product} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Nike Air Max 270')).toBeInTheDocument();
    expect(screen.getByText('$139.99')).toBeInTheDocument();
    expect(screen.getByText('12 in stock')).toBeInTheDocument();
  });

  it('shows "Out of stock" when stock_quantity is 0', () => {
    render(<ProductCard product={{ ...product, stock_quantity: 0 }} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows a low-stock warning when stock_quantity is low', () => {
    render(<ProductCard product={{ ...product, stock_quantity: 2 }} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('2 left')).toBeInTheDocument();
  });

  it('calls onEdit with the product when Edit is selected from the actions menu', () => {
    const onEdit = vi.fn();
    render(<ProductCard product={product} onEdit={onEdit} onDelete={() => {}} />);
    openMenu(product);
    fireEvent.click(screen.getByLabelText(`Edit ${product.name}`));
    expect(onEdit).toHaveBeenCalledWith(product);
  });

  it('calls onDelete with the product when Delete is selected from the actions menu', () => {
    const onDelete = vi.fn();
    render(<ProductCard product={product} onEdit={() => {}} onDelete={onDelete} />);
    openMenu(product);
    fireEvent.click(screen.getByLabelText(`Delete ${product.name}`));
    expect(onDelete).toHaveBeenCalledWith(product);
  });
});
