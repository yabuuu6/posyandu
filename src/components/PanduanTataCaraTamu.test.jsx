import { render, screen, fireEvent } from '@testing-library/react';
import PanduanTataCaraTamu from './PanduanTataCaraTamu';
import { describe, test, expect } from 'vitest';

describe('PanduanTataCaraTamu Component', () => {
  test('should render header and default Alur 5 Meja tab', () => {
    render(<PanduanTataCaraTamu isGuest={true} />);

    expect(screen.getByText(/Tata Cara & Panduan Posyandu/i)).toBeInTheDocument();
    expect(screen.getByText(/Khusus Tamu/i)).toBeInTheDocument();
    expect(screen.getByText(/Meja 1: Pendaftaran/i)).toBeInTheDocument();
    expect(screen.getByText(/Meja 5: Pelayanan Medis & Imunisasi/i)).toBeInTheDocument();
  });

  test('should switch tabs to Cara Pakai Mode Tamu', () => {
    render(<PanduanTataCaraTamu isGuest={true} />);

    const tamuTabButton = screen.getByRole('button', { name: /Cara Pakai Mode Tamu/i });
    fireEvent.click(tamuTabButton);

    expect(screen.getByText(/Mempelajari Alur Pelayanan Posyandu/i)).toBeInTheDocument();
    expect(screen.getByText(/Memahami Indikator Status Gizi WHO/i)).toBeInTheDocument();
  });

  test('should switch tabs to Kamus Z-Score WHO', () => {
    render(<PanduanTataCaraTamu isGuest={true} />);

    const kamusTabButton = screen.getByRole('button', { name: /Kamus Z-Score WHO/i });
    fireEvent.click(kamusTabButton);

    expect(screen.getByText(/BB\/U \(Berat menurut Umur\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TB\/U \(Tinggi menurut Umur\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sangat Pendek \(Severely Stunted\)/i)).toBeInTheDocument();
  });

  test('should collapse and expand guide on button click', () => {
    render(<PanduanTataCaraTamu isGuest={true} />);

    const collapseButton = screen.getByRole('button', { name: /Ciutkan Panduan/i });
    fireEvent.click(collapseButton);

    expect(screen.queryByText(/Meja 1: Pendaftaran/i)).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: /Buka Panduan Lengkap/i });
    fireEvent.click(expandButton);

    expect(screen.getByText(/Meja 1: Pendaftaran/i)).toBeInTheDocument();
  });
});
