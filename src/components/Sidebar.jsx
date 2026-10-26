import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Sun, Moon, LogOut, X } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './Sidebar.css';
import { useToast } from './Toast';

const Sidebar = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [isDark, setIsDark] = useState(() => {
    // Ambil preferensi dari localStorage atau sistem
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [user, setUser] = useState({ nama: 'Kader Posyandu', role: 'kader' });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    if (onClose) onClose();
    toast.confirm('Yakin ingin keluar dari akun ini?', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }, null, 'Ya, Keluar', 'danger');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar glass ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Brand */}
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logoImg} alt="TumbuhCeria Logo" className="sidebar-logo" />
          <div className="brand-text">
            <span className="brand-name">
              Tumbuh<span className="brand-accent">Ceria</span>
            </span>
            <span className="brand-sub">Posyandu Digital</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup Menu"
          title="Tutup Menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-menu">
        <NavLink 
          to="/" 
          className={({isActive}) => isActive ? "menu-item active" : "menu-item"} 
          end
          onClick={handleNavClick}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/balita" 
          className={({isActive}) => isActive ? "menu-item active" : "menu-item"}
          onClick={handleNavClick}
        >
          <Users size={20} />
          <span>Data Balita</span>
        </NavLink>

        <NavLink 
          to="/pengukuran" 
          className={({isActive}) => isActive ? "menu-item active" : "menu-item"}
          onClick={handleNavClick}
        >
          <Activity size={20} />
          <span>Pengukuran (WHO)</span>
        </NavLink>
      </div>

      {/* User Profile Card */}
      <div style={{
        marginTop: 'auto',
        marginBottom: '1rem',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-hover)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: user.role === 'tamu' ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary-light)',
            color: user.role === 'tamu' ? '#f59e0b' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0
          }}>
            {user.role === 'tamu' ? 'T' : (user.nama ? user.nama.charAt(0).toUpperCase() : 'K')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.nama}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: user.role === 'tamu' ? '#d97706' : 'var(--text-muted)',
              textTransform: 'capitalize'
            }}>
              {user.role === 'tamu' ? 'Mode Tamu (Lihat Saja)' : user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.08)',
            color: 'var(--danger)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
        >
          <LogOut size={12} /> Keluar
        </button>
      </div>

      {/* Dark mode toggle + Version badge */}
      <div className="sidebar-footer-badge" style={{ marginTop: 0, paddingTop: '1rem' }}>
        <button
          className="theme-toggle"
          onClick={() => setIsDark(d => !d)}
          title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <span className="version-badge">v1.0 · WHO Z-Score</span>
      </div>
    </aside>
  );
};

export default Sidebar;
