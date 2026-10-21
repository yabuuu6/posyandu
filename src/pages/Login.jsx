import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, loginGuest } from '../services/api';
import { Lock, User, Eye, EyeOff, AlertCircle, UserCheck, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ username, password });
      
      // Store token and user details in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Callback to app state if provided
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Gagal masuk. Pastikan username dan password benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setGuestLoading(true);

    try {
      const data = await loginGuest();

      // Store token and user details in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Callback to app state if provided
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('Guest login error:', err);
      setError(
        err.response?.data?.error ||
        'Gagal masuk sebagai tamu. Silakan coba lagi.'
      );
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.05) 90%), var(--bg-color)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Spheres */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'var(--primary)',
        filter: 'blur(120px)',
        opacity: 0.15,
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--secondary)',
        filter: 'blur(140px)',
        opacity: 0.12,
        zIndex: 0
      }}></div>

      <div className="card glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--glass-shadow)',
        zIndex: 1,
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <img src={logoImg} alt="TumbuhCeria Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
            TumbuhCeria
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Portal Posyandu Digital
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            color: 'var(--danger)',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Username
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', zIndex: 2 }} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="input-field"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', zIndex: 2 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 2
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || guestLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease',
              cursor: loading || guestLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0 1.25rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 0.75rem', fontWeight: 500, fontSize: '0.8rem' }}>atau lanjutkan sebagai</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* Guest Login Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading || guestLoading}
          className="btn-guest-login"
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(99, 102, 241, 0.08)',
            color: 'var(--primary)',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            cursor: loading || guestLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          {guestLoading ? (
            'Menyiapkan Akses Tamu...'
          ) : (
            <>
              <UserCheck size={18} />
              <span>Masuk sebagai Tamu (Mode Pengunjung)</span>
            </>
          )}
        </button>

        {/* Guest Mode Info Card */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px dashed var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Mode Tamu / Demo</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Dapat meninjau statistik dashboard, grafik WHO Z-Score, dan data posyandu secara langsung tanpa kata sandi kader.
          </p>
        </div>
      </div>

      {/* Focus border styling injection */}
      <style>{`
        .input-field:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15) !important;
        }
        .btn-guest-login:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.16) !important;
          border-color: var(--primary) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default Login;
