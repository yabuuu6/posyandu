import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPengukuranByBalitaId, deletePengukuran } from '../services/api';
import { 
  X, 
  Plus, 
  Activity, 
  Calendar, 
  User, 
  Phone, 
  Pencil, 
  Trash2, 
  AlertCircle,
  TrendingUp,
  Scale,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './Toast';

const RiwayatPengukuranModal = ({ balita, onClose }) => {
  const toast = useToast();
  const [pengukuranList, setPengukuranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPengukuran = async () => {
    if (!balita?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPengukuranByBalitaId(balita.id);
      setPengukuranList(data || []);
    } catch (err) {
      console.error('Error fetching pengukuran by balita:', err);
      setError('Gagal memuat riwayat pengukuran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengukuran();
  }, [balita?.id]);

  // Handle keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDeletePengukuran = (id, tanggal) => {
    toast.confirm(
      `Yakin ingin menghapus data pengukuran tanggal ${new Date(tanggal).toLocaleDateString('id-ID')}?`,
      async () => {
        try {
          await deletePengukuran(id);
          toast.success('Data pengukuran berhasil dihapus');
          fetchPengukuran();
        } catch (err) {
          console.error(err);
          toast.error('Gagal menghapus data pengukuran');
        }
      }
    );
  };

  // Helper: hitung usia balita saat ini
  const calculateCurrentAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()) + (now.getDate() < birth.getDate() ? -1 : 0);
    const safeMonths = Math.max(0, totalMonths);

    if (years > 0) {
      return `${years} thn ${months} bln (${safeMonths} bln)`;
    }
    return `${safeMonths} bulan`;
  };

  // Helper: hitung umur saat pengukuran
  const calculateAgeAtMeasure = (birthDate, measureDate) => {
    if (!birthDate || !measureDate) return '-';
    const birth = new Date(birthDate);
    const measure = new Date(measureDate);

    let months = (measure.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += measure.getMonth();
    if (measure.getDate() < birth.getDate()) {
      months -= 1;
    }
    return `${Math.max(0, months)} bln`;
  };

  const getBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('baik') || s.includes('normal')) return 'badge badge-success';
    if (s.includes('buruk') || s.includes('sangat pendek') || s.includes('obesitas')) return 'badge badge-danger';
    if (s.includes('kurang') || s.includes('pendek') || s.includes('beresiko') || s.includes('lebih')) return 'badge badge-warning';
    return 'badge badge-info';
  };

  const latest = pengukuranList.length > 0 ? pengukuranList[0] : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 0.5rem',
        animation: 'fade-in 0.2s ease-out forwards',
      }}
      onClick={onClose}
    >
      <div
        className="card modal-dialog-responsive"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'confirm-scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="modal-header-responsive"
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {balita?.nama}
                </h2>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: balita?.jenis_kelamin === 'L' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                    color: balita?.jenis_kelamin === 'L' ? '#2563EB' : '#DB2777',
                  }}
                >
                  {balita?.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Riwayat Pengukuran dan Status Pertumbuhan Balita
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Tutup (Esc)"
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'var(--surface-hover)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Balita Summary Strip */}
        <div
          className="modal-summary-responsive"
          style={{
            padding: '1rem 1.75rem',
            background: 'var(--surface-hover)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Calendar size={16} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Lahir:</span>
              <strong>{balita?.tanggal_lahir ? new Date(balita.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <TrendingUp size={16} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Usia Saat Ini:</span>
              <strong>{calculateCurrentAge(balita?.tanggal_lahir)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <User size={16} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Orang Tua:</span>
              <strong>{balita?.nama_orang_tua || '-'}</strong>
            </div>
            {balita?.no_hp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                <Phone size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>No HP:</span>
                <strong>{balita.no_hp}</strong>
              </div>
            )}
          </div>

          <Link
            to={`/pengukuran/tambah?balita_id=${balita?.id}`}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Input Pengukuran Baru
          </Link>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Activity size={32} className="animate-spin" style={{ marginBottom: '0.75rem', color: 'var(--primary)' }} />
              <p>Memuat riwayat pengukuran...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchPengukuran}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                Coba Lagi
              </button>
            </div>
          ) : pengukuranList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border)',
                background: 'var(--surface-hover)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '1rem',
                }}
              >
                <Scale size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                Belum Ada Riwayat Pengukuran
              </h4>
              <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Balita <strong>{balita?.nama}</strong> belum memiliki rekaman pengukuran berat dan tinggi badan.
              </p>
              <Link
                to={`/pengukuran/tambah?balita_id=${balita?.id}`}
                className="btn btn-primary"
                style={{ display: 'inline-flex' }}
              >
                <Plus size={16} /> Input Pengukuran Pertama
              </Link>
            </div>
          ) : (
            <div>
              {/* Table Riwayat */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>
                  Daftar Riwayat Pengukuran ({pengukuranList.length} Catatan)
                </h4>
              </div>

              <div className="mobile-table-hint">
                <span>👉</span>
                <span>Geser tabel ke samping untuk melihat indikator antropometri & aksi</span>
              </div>

              <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                      <th>Tanggal</th>
                      <th>Umur</th>
                      <th>BB (kg)</th>
                      <th>TB (cm)</th>
                      <th>BB/U</th>
                      <th>TB/U</th>
                      <th>BB/TB</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengukuranList.map((p, idx) => (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>
                          {new Date(p.tanggal_ukur).toLocaleDateString('id-ID')}
                        </td>
                        <td>{calculateAgeAtMeasure(balita?.tanggal_lahir, p.tanggal_ukur)}</td>
                        <td>
                          <strong>{p.berat_badan}</strong>
                        </td>
                        <td>
                          <strong>{p.tinggi_badan}</strong>
                        </td>
                        <td>
                          <span className={getBadgeClass(p.status_bbu)} title={p.zscore_bbu ? `Z-Score: ${Number(p.zscore_bbu).toFixed(2)}` : ''}>
                            {p.status_bbu}
                          </span>
                        </td>
                        <td>
                          <span className={getBadgeClass(p.status_tbu)} title={p.zscore_tbu ? `Z-Score: ${Number(p.zscore_tbu).toFixed(2)}` : ''}>
                            {p.status_tbu}
                          </span>
                        </td>
                        <td>
                          <span className={getBadgeClass(p.status_bbtb)} title={p.zscore_bbtb ? `Z-Score: ${Number(p.zscore_bbtb).toFixed(2)}` : ''}>
                            {p.status_bbtb}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <Link
                              to={`/pengukuran/edit/${p.id}`}
                              className="btn-icon"
                              title="Edit Pengukuran"
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Pencil size={16} color="var(--primary)" />
                            </Link>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleDeletePengukuran(p.id, p.tanggal_ukur)}
                              title="Hapus Pengukuran"
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Trash2 size={16} color="var(--danger)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--surface)',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPengukuranModal;
