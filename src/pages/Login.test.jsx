import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
  loginGuest: vi.fn(),
}));

describe('Login Component - Tamu / Guest Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should render guest login button with proper text', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const guestButton = screen.getByRole('button', { name: /Masuk sebagai Tamu/i });
    expect(guestButton).toBeInTheDocument();
    expect(screen.getByText(/Mode Tamu \/ Demo/i)).toBeInTheDocument();
  });

  test('should handle guest login successfully', async () => {
    const mockGuestResponse = {
      token: 'mock-guest-token',
      user: {
        id: 2,
        username: 'tamu',
        nama: 'Tamu Posyandu',
        role: 'tamu'
      }
    };
    api.loginGuest.mockResolvedValueOnce(mockGuestResponse);

    const handleLoginSuccess = vi.fn();

    render(
      <BrowserRouter>
        <Login onLoginSuccess={handleLoginSuccess} />
      </BrowserRouter>
    );

    const guestButton = screen.getByRole('button', { name: /Masuk sebagai Tamu/i });
    fireEvent.click(guestButton);

    await waitFor(() => {
      expect(api.loginGuest).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('token')).toBe('mock-guest-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockGuestResponse.user);
      expect(handleLoginSuccess).toHaveBeenCalledWith(mockGuestResponse.user);
    });
  });

  test('should display error if guest login fails', async () => {
    api.loginGuest.mockRejectedValueOnce({
      response: { data: { error: 'Gagal terhubung ke database' } }
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const guestButton = screen.getByRole('button', { name: /Masuk sebagai Tamu/i });
    fireEvent.click(guestButton);

    await waitFor(() => {
      expect(screen.getByText(/Gagal terhubung ke database/i)).toBeInTheDocument();
    });
  });
});
