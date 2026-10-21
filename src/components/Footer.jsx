import { Heart, Shield } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">

        {/* Kiri: Branding */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logoImg} alt="TumbuhCeria" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                Tumbuh<span style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ceria</span>
              </span>
              <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Posyandu Digital
              </span>
            </div>
          </div>
          <p className="footer-tagline">
            Platform cerdas pemantauan tumbuh kembang balita berbasis standar WHO — hadir untuk setiap Posyandu di Indonesia.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', color: 'var(--primary)', fontWeight: 500 }}>
              WHO Z-Score
            </span>
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4', fontWeight: 500 }}>
              Kemenkes RI
            </span>
          </div>
        </div>

        {/* Kanan: Badge */}
        <div className="footer-right">
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Keamanan & Integrasi</p>
          <div className="footer-badge">
            <Shield size={13} />
            <span>Data Aman & Terenkripsi</span>
          </div>
          <div className="footer-badge" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Standar WHO 2006</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <img src={logoImg} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', marginRight: '6px' }} />
        <span>© {year} <strong>TumbuhCeria</strong>. Dibuat dengan</span>
        <Heart size={12} fill="var(--danger)" color="var(--danger)" style={{ margin: '0 5px', flexShrink: 0 }} />
        <span>untuk kesehatan balita Indonesia.</span>
      </div>
    </footer>
  );
};

export default Footer;
