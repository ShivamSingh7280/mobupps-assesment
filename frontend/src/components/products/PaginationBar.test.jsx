import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaginationBar from './PaginationBar';

describe('PaginationBar', () => {
  it('shows the item range and page indicator', () => {
    render(<PaginationBar page={1} totalPages={4} total={24} pageSize={6} onChange={() => {}} />);
    expect(screen.getByText('1–6 of 24')).toBeInTheDocument();
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
  });

  it('shows a later page range correctly', () => {
    render(<PaginationBar page={4} totalPages={4} total={24} pageSize={6} onChange={() => {}} />);
    expect(screen.getByText('19–24 of 24')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<PaginationBar page={1} totalPages={1} total={3} pageSize={6} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls onChange with the next page when Next is clicked', () => {
    const onChange = vi.fn();
    render(<PaginationBar page={1} totalPages={3} total={18} pageSize={6} onChange={onChange} />);
    screen.getByRole('button', { name: 'Next' }).click();
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with the previous page when Previous is clicked', () => {
    const onChange = vi.fn();
    render(<PaginationBar page={2} totalPages={3} total={18} pageSize={6} onChange={onChange} />);
    screen.getByRole('button', { name: 'Previous' }).click();
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
