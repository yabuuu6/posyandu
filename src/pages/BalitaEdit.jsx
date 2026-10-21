import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBalitaById, updateBalita } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const BalitaEdit = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    nama_orang_tua: '',
    no_hp: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'tamu') {
      toast.warning('Akses ditolak: Akun tamu hanya memiliki hak akses lihat data');
      navigate('/balita');
      return;
    }

    const fetchBalita = async () => {
      try {
        const data = await getBalitaById(id);
        const formattedDate = data.tanggal_lahir ? data.tanggal_lahir.split('T')[0] : '';
        setFormData({
          nama: data.nama || '',
          tanggal_lahir: formattedDate,
          jenis_kelamin: data.jenis_kelamin || 'L',
          nama_orang_tua: data.nama_orang_tua || '',
          no_hp: data.no_hp || ''
        });
      } catch (error) {
        console.error('Error fetching balita:', error);
        toast.error('Gagal memuat data balita');
        navigate('/balita');
      } finally {
        setLoading(false);
      }
    };
    fetchBalita();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'nama') {
      if (/[^a-zA-Z\s]/.test(value)) {
        newErrors.nama = 'Nama balita hanya boleh berisi huruf (tidak bisa diisi angka atau karakter khusus)';
      } else if (value.length > 30) {
        newErrors.nama = 'Nama balita melebihi batas maksimal 30 huruf';
      } else {
        delete newErrors.nama;
      }
      const sanitized = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 30);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      setErrors(newErrors);
      return;
    }

    if (name === 'no_hp') {
      if (/[a-zA-Z]/.test(value)) {
        newErrors.no_hp = 'Nomor telepon tidak bisa diisi huruf (hanya boleh angka)';
      } else {
        delete newErrors.no_hp;
      }
      const sanitized = value.replace(/\D/g, '').slice(0, 15);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      setErrors(newErrors);
      return;
    }

    if (name === 'nama_orang_tua') {
      // Tidak bisa angka dan karakter (hanya huruf dan spasi, maksimal 30)
      if (/[^a-zA-Z\s]/.test(value)) {
        newErrors.nama_orang_tua = 'Nama orang tua hanya boleh berisi huruf (tidak bisa diisi angka atau karakter khusus)';
      } else if (value.length > 30) {
        newErrors.nama_orang_tua = 'Nama orang tua melebihi batas maksimal 30 huruf';
      } else {
        delete newErrors.nama_orang_tua;
      }
      const sanitized = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 30);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      setErrors(newErrors);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentErrors = {};
    if (!formData.nama.trim()) {
      currentErrors.nama = 'Nama balita wajib diisi';
    } else if (formData.nama.length > 30) {
      currentErrors.nama = 'Nama balita maksimal 30 huruf';
    } else if (/[^a-zA-Z\s]/.test(formData.nama)) {
      currentErrors.nama = 'Nama balita tidak bisa diisi angka atau karakter khusus';
    }

    if (!formData.nama_orang_tua.trim()) {
      currentErrors.nama_orang_tua = 'Nama orang tua wajib diisi';
    } else if (formData.nama_orang_tua.length > 30) {
      currentErrors.nama_orang_tua = 'Nama orang tua maksimal 30 huruf';
    } else if (/[^a-zA-Z\s]/.test(formData.nama_orang_tua)) {
      currentErrors.nama_orang_tua = 'Nama orang tua tidak bisa diisi angka atau karakter khusus';
    }

    if (formData.no_hp && /[a-zA-Z]/.test(formData.no_hp)) {
      currentErrors.no_hp = 'Nomor telepon tidak bisa diisi huruf';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('Mohon perbaiki data input yang belum sesuai');
      return;
    }

    setSubmitting(true);
    try {
      await updateBalita(id, formData);
      toast.success('Berhasil memperbarui data balita!');
      navigate('/balita');
    } catch (error) {
      console.error('Error updating balita:', error);
      toast.error(error.response?.data?.error || 'Gagal memperbarui data balita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Memuat data balita...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/balita" className="btn btn-secondary btn-icon" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Edit Data Balita</h1>
            <p className="page-subtitle">Ubah informasi lengkap peserta Posyandu</p>
          </div>
        </div>
      </div>

      <div className="card glass">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label style={{ margin: 0 }}>Nama Balita</label>
              <span style={{ fontSize: '0.75rem', color: formData.nama.length >= 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {formData.nama.length}/30 huruf
              </span>
            </div>
            <input 
              type="text" 
              className="input" 
              name="nama" 
              value={formData.nama} 
              onChange={handleInputChange} 
              maxLength={30}
              required 
              placeholder="Masukkan nama lengkap balita (maks 30 huruf)" 
              style={errors.nama ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
            />
            {errors.nama ? (
              <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.nama}
              </small>
            ) : (
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Hanya huruf dan spasi, tidak boleh angka atau karakter khusus (maksimal 30 huruf).
              </small>
            )}
          </div>
          
          <div className="input-group">
            <label>Tanggal Lahir</label>
            <input 
              type="date" 
              className="input" 
              name="tanggal_lahir" 
              value={formData.tanggal_lahir} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Jenis Kelamin</label>
            <select className="select" name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label style={{ margin: 0 }}>Nama Orang Tua</label>
              <span style={{ fontSize: '0.75rem', color: formData.nama_orang_tua.length >= 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {formData.nama_orang_tua.length}/30 huruf
              </span>
            </div>
            <input 
              type="text" 
              className="input" 
              name="nama_orang_tua" 
              value={formData.nama_orang_tua} 
              onChange={handleInputChange} 
              maxLength={30}
              required 
              placeholder="Nama Ibu / Bapak / Wali (maks 30 huruf)" 
              style={errors.nama_orang_tua ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
            />
            {errors.nama_orang_tua ? (
              <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.nama_orang_tua}
              </small>
            ) : (
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Hanya huruf dan spasi, tidak boleh angka atau karakter khusus (maksimal 30 huruf).
              </small>
            )}
          </div>

          <div className="input-group">
            <label>No. HP Orang Tua</label>
            <input 
              type="tel" 
              className="input" 
              name="no_hp" 
              value={formData.no_hp} 
              onChange={handleInputChange} 
              maxLength={15}
              placeholder="Contoh: 08123456789 (hanya angka)" 
              style={errors.no_hp ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
            />
            {errors.no_hp ? (
              <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.no_hp}
              </small>
            ) : (
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Nomor kontak aktif orang tua balita (hanya angka, tidak bisa diisi huruf)
              </small>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/balita" className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
              <Save size={18} /> {submitting ? 'Menyimpan...' : 'Perbarui Balita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalitaEdit;
