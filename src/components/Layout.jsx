import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Menu, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import logoImg from '../assets/logo.png';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Automatically close mobile sidebar drawer whenever route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Keep dark mode state in sync with html attribute
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const html = document.documentElement;
    if (nextDark) {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header glass">
        <div className="mobile-header-brand">
          <img src={logoImg} alt="TumbuhCeria Logo" className="mobile-header-logo" />
          <span className="mobile-header-title">
            Tumbuh<span className="brand-accent">Ceria</span>
          </span>
        </div>
        <div className="mobile-header-actions">
          <button 
            type="button" 
            className="mobile-header-btn" 
            onClick={toggleTheme} 
            title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            aria-label="Toggle tema gelap/terang"
          >
            {isDark ? <Sun size={19} color="#F59E0B" /> : <Moon size={19} color="var(--primary)" />}
          </button>
          <button 
            type="button" 
            className="mobile-header-btn mobile-hamburger-btn" 
            onClick={() => setIsSidebarOpen(true)}
            title="Buka Menu Navigasi"
            aria-label="Buka Menu Navigasi"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar (Desktop fixed, Mobile off-canvas drawer) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Content wrapper */}
      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Mobile Bottom Navigation Bar for 1-Thumb Fast Access */}
      <nav className="mobile-bottom-nav glass" aria-label="Navigasi Bawah">
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon">
            <LayoutDashboard size={20} />
          </div>
          <span className="bottom-nav-label">Dashboard</span>
        </NavLink>

        <NavLink 
          to="/balita" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon">
            <Users size={20} />
          </div>
          <span className="bottom-nav-label">Balita</span>
        </NavLink>

        <NavLink 
          to="/pengukuran" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon">
            <Activity size={20} />
          </div>
          <span className="bottom-nav-label">Pengukuran</span>
        </NavLink>

        <button 
          type="button" 
          className={`bottom-nav-item bottom-nav-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(prev => !prev)}
          aria-label="Menu Lengkap"
        >
          <div className="bottom-nav-icon">
            <Menu size={20} />
          </div>
          <span className="bottom-nav-label">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;

