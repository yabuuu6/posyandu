import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RiwayatPengukuranModal from './RiwayatPengukuranModal';
import { ToastProvider } from './Toast';
import * as api from '../services/api';
import { expect, test, describe, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  getPengukuranByBalitaId: vi.fn(),
  deletePengukuran: vi.fn(),
}));

const mockBalita = {
  id: 1,
  nama: 'Ananda Rizky',
  jenis_kelamin: 'L',
  tanggal_lahir: '2025-01-15',
  nama_orang_tua: 'Budi Santoso',
  no_hp: '081234567890',
};

const mockMeasurements = [
  {
    id: 101,
    balita_id: 1,
    tanggal_ukur: '2026-01-15',
    berat_badan: 9.8,
    tinggi_badan: 76.5,
    status_bbu: 'Gizi Baik',
    status_tbu: 'Normal',
    status_bbtb: 'Gizi Baik (Normal)',
    zscore_bbu: 0.12,
    zscore_tbu: -0.45,
    zscore_bbtb: 0.25,
  },
];

describe('RiwayatPengukuranModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render balita details and fetch measurement history', async () => {
    api.getPengukuranByBalitaId.mockResolvedValueOnce(mockMeasurements);
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <ToastProvider>
          <RiwayatPengukuranModal balita={mockBalita} onClose={handleClose} />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Ananda Rizky')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getPengukuranByBalitaId).toHaveBeenCalledWith(1);
    });

    const bbElements = await screen.findAllByText('9.8');
    expect(bbElements.length).toBeGreaterThan(0);

    const tbElements = await screen.findAllByText('76.5');
    expect(tbElements.length).toBeGreaterThan(0);
  });

  test('should display empty message when balita has no measurement history', async () => {
    api.getPengukuranByBalitaId.mockResolvedValueOnce([]);
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <ToastProvider>
          <RiwayatPengukuranModal balita={mockBalita} onClose={handleClose} />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Belum Ada Riwayat Pengukuran/i)).toBeInTheDocument();
  });

  test('should call onClose when Tutup button is clicked', async () => {
    api.getPengukuranByBalitaId.mockResolvedValueOnce([]);
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <ToastProvider>
          <RiwayatPengukuranModal balita={mockBalita} onClose={handleClose} />
        </ToastProvider>
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole('button', { name: 'Tutup' });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
