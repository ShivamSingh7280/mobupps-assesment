import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('calls onChange with the typed value', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} isSearching={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'shoes' } });
    expect(onChange).toHaveBeenCalledWith('shoes');
  });

  it('reflects the current value', () => {
    render(<SearchBar value="nike" onChange={() => {}} isSearching={false} />);
    expect(screen.getByRole('textbox')).toHaveValue('nike');
  });

  it('shows a loading indicator while a search is in flight', () => {
    render(<SearchBar value="nike" onChange={() => {}} isSearching />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('hides the loading indicator when not searching', () => {
    render(<SearchBar value="nike" onChange={() => {}} isSearching={false} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
