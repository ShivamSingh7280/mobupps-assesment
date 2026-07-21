import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaginationBar from './PaginationBar';

describe('PaginationBar', () => {
  it('renders a disabled control when there is only one page', () => {
    render(<PaginationBar page={1} totalPages={1} onChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'pagination navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'page 1' })).toBeDisabled();
  });

  it('renders pagination controls when there is more than one page', () => {
    render(<PaginationBar page={1} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'pagination navigation' })).toBeInTheDocument();
  });

  it('calls onChange with the newly selected page', () => {
    const onChange = vi.fn();
    render(<PaginationBar page={1} totalPages={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('marks the current page as selected', () => {
    render(<PaginationBar page={2} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'page 2' })).toHaveAttribute('aria-current', 'page');
  });
});
