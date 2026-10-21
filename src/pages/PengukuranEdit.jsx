import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPengukuranById, updatePengukuran } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const PengukuranEdit = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [namaBalita, setNamaBalita] = useState('');
  const [tglLahirBalita, setTglLahirBalita] = useState('');
  const [errors, setErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    tanggal_ukur: '',
    berat_badan: '',
    tinggi_badan: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'tamu') {
      toast.warning('Akses ditolak: Akun tamu hanya memiliki hak akses lihat data');
      navigate('/pengukuran');
      return;
    }

    const fetchPengukuranData = async () => {
      try {
        const data = await getPengukuranById(id);
        setNamaBalita(data.nama_balita);
        if (data.tanggal_lahir) {
          const formattedBirth = typeof data.tanggal_lahir === 'string'
            ? data.tanggal_lahir.split('T')[0]
            : new Date(data.tanggal_lahir).toISOString().split('T')[0];
          setTglLahirBalita(formattedBirth);
        }
        setFormData({
          tanggal_ukur: data.tanggal_ukur ? data.tanggal_ukur.split('T')[0] : '',
          berat_badan: data.berat_badan,
          tinggi_badan: data.tinggi_badan
        });
      } catch (error) {
        console.error('Error fetching pengukuran data:', error);
        toast.error('Gagal memuat data pengukuran');
        navigate('/pengukuran');
      } finally {
        setLoading(false);
      }
    };
    fetchPengukuranData();
  }, [id, navigate]);

  const validateField = (name, value) => {
    let err = null;

    if (name === 'tanggal_ukur') {
      if (!value) {
        err = 'Tanggal pengukuran wajib diisi';
      } else if (value > todayStr) {
        err = 'Tanggal pengukuran tidak boleh melebihi hari ini';
      } else if (tglLahirBalita && value < tglLahirBalita) {
        err = `Tanggal pengukuran tidak boleh lebih awal dari tanggal lahir (${new Date(tglLahirBalita).toLocaleDateString('id-ID')})`;
      }
    }

    if (name === 'berat_badan') {
      if (value === '' || value === null) {
        err = 'Berat badan wajib diisi';
      } else {
        const bb = parseFloat(value);
        if (isNaN(bb)) {
          err = 'Berat badan harus berupa angka valid';
        } else if (bb < 1.0 || bb > 35.0) {
          err = 'Berat badan balita harus antara 1.0 s/d 35.0 kg';
        }
      }
    }

    if (name === 'tinggi_badan') {
      if (value === '' || value === null) {
        err = 'Tinggi badan wajib diisi';
      } else {
        const tb = parseFloat(value);
        if (isNaN(tb)) {
          err = 'Tinggi badan harus berupa angka valid';
        } else if (tb < 30.0 || tb > 130.0) {
          err = 'Tinggi badan balita harus antara 30.0 s/d 130.0 cm';
        }
      }
    }

    return err;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const fieldErr = validateField(name, value);
    setErrors(prev => {
      const next = { ...prev };
      if (fieldErr) next[name] = fieldErr;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentErrors = {};
    const tglErr = validateField('tanggal_ukur', formData.tanggal_ukur);
    if (tglErr) currentErrors.tanggal_ukur = tglErr;

    const bbErr = validateField('berat_badan', formData.berat_badan);
    if (bbErr) currentErrors.berat_badan = bbErr;

    const tbErr = validateField('tinggi_badan', formData.tinggi_badan);
    if (tbErr) currentErrors.tinggi_badan = tbErr;

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('Mohon perbaiki nilai input pengukuran yang belum sesuai');
      return;
    }

    setSubmitting(true);
    try {
      await updatePengukuran(id, formData);
      toast.success('Berhasil memperbarui data pengukuran!');
      navigate('/pengukuran');
    } catch (error) {
      console.error('Error updating pengukuran:', error);
      toast.error(error.response?.data?.error || 'Gagal memperbarui data pengukuran');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-fade-in"><p>Memuat data pengukuran...</p></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/pengukuran" className="btn btn-secondary btn-icon" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Edit Data Pengukuran</h1>
            <p className="page-subtitle">Kalkulasi ulang otomatis status gizi WHO</p>
          </div>
        </div>
      </div>

      <div className="card glass">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nama Balita</label>
            <input 
              type="text" 
              className="input" 
              value={namaBalita} 
              disabled 
              style={{ background: 'var(--surface-hover)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
            />
          </div>
          
          <div className="input-group">
            <label>Tanggal Pengukuran</label>
            <input 
              type="date" 
              className="input" 
              name="tanggal_ukur" 
              value={formData.tanggal_ukur} 
              max={todayStr}
              min={tglLahirBalita || undefined}
              onChange={handleInputChange} 
              required 
              style={errors.tanggal_ukur ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
            />
            {errors.tanggal_ukur ? (
              <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.tanggal_ukur}
              </small>
            ) : (
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Maksimal hari ini dan tidak boleh lebih awal dari tanggal lahir balita.
              </small>
            )}
          </div>

          <div className="grid-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr', marginBottom: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Berat Badan (kg)</label>
              <input 
                type="number" 
                step="0.01" 
                min="1.0"
                max="35.0"
                className="input" 
                name="berat_badan" 
                value={formData.berat_badan} 
                onChange={handleInputChange} 
                placeholder="Contoh: 10.5" 
                required 
                style={errors.berat_badan ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
              />
              {errors.berat_badan ? (
                <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} /> {errors.berat_badan}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Rentang: 1.0 s/d 35.0 kg
                </small>
              )}
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Tinggi Badan (cm)</label>
              <input 
                type="number" 
                step="0.1" 
                min="30.0"
                max="130.0"
                className="input" 
                name="tinggi_badan" 
                value={formData.tinggi_badan} 
                onChange={handleInputChange} 
                placeholder="Contoh: 80.2" 
                required 
                style={errors.tinggi_badan ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
              />
              {errors.tinggi_badan ? (
                <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} /> {errors.tinggi_badan}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Rentang: 30.0 s/d 130.0 cm
                </small>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/pengukuran" className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
              <Save size={18} style={{ marginRight: '0.5rem' }} /> {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PengukuranEdit;
