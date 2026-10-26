import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getBalita, createPengukuran } from '../services/api';
import { ArrowLeft, Activity, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import SearchableBalitaSelect from '../components/SearchableBalitaSelect';

const PengukuranCreate = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetBalitaId = searchParams.get('balita_id') || location.state?.balita_id || '';

  const [balitaList, setBalitaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    balita_id: targetBalitaId ? String(targetBalitaId) : '',
    tanggal_ukur: todayStr,
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

    const fetchBalitaData = async () => {
      try {
        const data = await getBalita();
        setBalitaList(data);
        if (data.length > 0) {
          const matched = targetBalitaId && data.some(b => String(b.id) === String(targetBalitaId));
          setFormData(prev => ({ 
            ...prev, 
            balita_id: matched ? String(targetBalitaId) : (prev.balita_id || String(data[0].id))
          }));
        }
      } catch (error) {
        console.error('Error fetching balita data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalitaData();
  }, [targetBalitaId]);

  // Ambil data balita yang sedang dipilih
  const selectedBalita = balitaList.find(b => String(b.id) === String(formData.balita_id));
  const tglLahirBalita = selectedBalita?.tanggal_lahir 
    ? (typeof selectedBalita.tanggal_lahir === 'string' 
        ? selectedBalita.tanggal_lahir.split('T')[0] 
        : new Date(selectedBalita.tanggal_lahir).toISOString().split('T')[0]) 
    : '';

  const validateField = (name, value, balitaTglLahir = tglLahirBalita) => {
    let err = null;

    if (name === 'tanggal_ukur') {
      if (!value) {
        err = 'Tanggal pengukuran wajib diisi';
      } else if (value > todayStr) {
        err = 'Tanggal pengukuran tidak boleh melebihi hari ini';
      } else if (balitaTglLahir && value < balitaTglLahir) {
        err = `Tanggal pengukuran tidak boleh lebih awal dari tanggal lahir (${new Date(balitaTglLahir).toLocaleDateString('id-ID')})`;
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
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    // Validasi real-time
    let currentTglLahir = tglLahirBalita;
    if (name === 'balita_id') {
      const b = balitaList.find(item => String(item.id) === String(value));
      currentTglLahir = b?.tanggal_lahir ? b.tanggal_lahir.split('T')[0] : '';
    }

    const fieldErr = validateField(name, value, currentTglLahir);
    setErrors(prev => {
      const next = { ...prev };
      if (fieldErr) {
        next[name] = fieldErr;
      } else {
        delete next[name];
      }
      return next;
    });

    // Jika ganti balita, cek juga tanggal_ukur terhadap tgl lahir balita baru
    if (name === 'balita_id' && formData.tanggal_ukur) {
      const tglErr = validateField('tanggal_ukur', formData.tanggal_ukur, currentTglLahir);
      setErrors(prev => {
        const next = { ...prev };
        if (tglErr) next.tanggal_ukur = tglErr;
        else delete next.tanggal_ukur;
        return next;
      });
    }
  };

  const handleSelectBalita = (balita) => {
    const currentTglLahir = balita?.tanggal_lahir 
      ? (typeof balita.tanggal_lahir === 'string' 
          ? balita.tanggal_lahir.split('T')[0] 
          : new Date(balita.tanggal_lahir).toISOString().split('T')[0]) 
      : '';

    setFormData(prev => ({ ...prev, balita_id: String(balita.id) }));

    setErrors(prev => {
      const next = { ...prev };
      delete next.balita_id;
      if (formData.tanggal_ukur) {
        const tglErr = validateField('tanggal_ukur', formData.tanggal_ukur, currentTglLahir);
        if (tglErr) next.tanggal_ukur = tglErr;
        else delete next.tanggal_ukur;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi seluruh field sebelum submit
    const currentErrors = {};
    if (!formData.balita_id) {
      currentErrors.balita_id = 'Pilih balita terlebih dahulu';
    }

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
      await createPengukuran(formData);
      toast.success('Berhasil menyimpan data pengukuran!');
      navigate('/pengukuran');
    } catch (error) {
      console.error('Error adding pengukuran:', error);
      toast.error(error.response?.data?.error || 'Gagal menambahkan data pengukuran');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-fade-in"><p>Memuat data balita...</p></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/pengukuran" className="btn btn-secondary btn-icon" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Input Pengukuran Baru</h1>
            <p className="page-subtitle">Kalkulasi otomatis status gizi WHO</p>
          </div>
        </div>
      </div>

      <div className="card glass">
        {balitaList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Belum ada data balita. Silakan tambahkan data balita terlebih dahulu.</p>
            <Link to="/balita/tambah" className="btn btn-primary">Tambah Balita</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ margin: 0 }}>Pilih Balita</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cari nama balita / orang tua</span>
              </div>
              <SearchableBalitaSelect 
                balitaList={balitaList}
                selectedId={formData.balita_id}
                onSelect={handleSelectBalita}
                error={errors.balita_id}
              />
              {errors.balita_id && (
                <small style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} /> {errors.balita_id}
                </small>
              )}
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

            <div className="grid-2 form-grid-2-responsive" style={{ gap: '1rem', marginBottom: '1rem' }}>
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
                  required 
                  placeholder="Contoh: 12.5" 
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
                  required 
                  placeholder="Contoh: 85.0" 
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

            <div className="form-actions-responsive" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/pengukuran" className="btn btn-secondary" style={{ flex: 1 }}>
                Batal
              </Link>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                <Activity size={18} /> {submitting ? 'Menyimpan...' : 'Simpan Pengukuran'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PengukuranCreate;
