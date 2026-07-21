import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../hooks/useAuth');

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Secret Products Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading spinner while auth status is unresolved', () => {
    useAuth.mockReturnValue({ status: 'loading' });
    renderProtected();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated', () => {
    useAuth.mockReturnValue({ status: 'unauthenticated' });
    renderProtected();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Products Page')).not.toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    useAuth.mockReturnValue({ status: 'authenticated' });
    renderProtected();
    expect(screen.getByText('Secret Products Page')).toBeInTheDocument();
  });
});
