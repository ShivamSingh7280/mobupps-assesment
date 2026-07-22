import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaginationBar from './PaginationBar';

describe('PaginationBar', () => {
  it('shows the item range', () => {
    render(
      <PaginationBar page={1} totalPages={4} total={24} pageSize={6} onChange={() => {}} onPageSizeChange={() => {}} />
    );
    expect(screen.getByText('1–6 of 24')).toBeInTheDocument();
  });

  it('shows a later page range correctly', () => {
    render(
      <PaginationBar page={4} totalPages={4} total={24} pageSize={6} onChange={() => {}} onPageSizeChange={() => {}} />
    );
    expect(screen.getByText('19–24 of 24')).toBeInTheDocument();
  });

  it('disables the previous-page button on the first page', () => {
    render(
      <PaginationBar page={1} totalPages={3} total={18} pageSize={6} onChange={() => {}} onPageSizeChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: /go to previous page/i })).toBeDisabled();
  });

  it('calls onChange with the next page when the next-page control is clicked', () => {
    const onChange = vi.fn();
    render(
      <PaginationBar page={1} totalPages={3} total={18} pageSize={6} onChange={onChange} onPageSizeChange={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /go to next page/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with the previous page when the previous-page control is clicked', () => {
    const onChange = vi.fn();
    render(
      <PaginationBar page={2} totalPages={3} total={18} pageSize={6} onChange={onChange} onPageSizeChange={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /go to previous page/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('lists the expected per-page options and calls onPageSizeChange on selection', () => {
    const onPageSizeChange = vi.fn();
    render(
      <PaginationBar
        page={1}
        totalPages={3}
        total={18}
        pageSize={6}
        onChange={() => {}}
        onPageSizeChange={onPageSizeChange}
      />
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Per page' }));
    [6, 12, 18, 24, 30].forEach((option) => {
      expect(screen.getByRole('option', { name: `${option} Products` })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('option', { name: '24 Products' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(24);
  });
});
