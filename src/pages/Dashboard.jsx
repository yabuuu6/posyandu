import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Activity, AlertTriangle, Heart } from 'lucide-react';
import PanduanTataCaraTamu from '../components/PanduanTataCaraTamu';

const COLORS = {
  'Gizi Baik (Normal)': '#10B981',
  'Normal': '#10B981',
  'Gizi Kurang (Underweight)': '#F59E0B',
  'Pendek (Stunted)': '#F59E0B',
  'Gizi Kurang (Wasted)': '#F59E0B',
  'Gizi Buruk (Severely Underweight)': '#EF4444',
  'Sangat Pendek (Severely Stunted)': '#EF4444',
  'Gizi Buruk (Severely Wasted)': '#EF4444',
  'Risiko Berat Badan Lebih': '#3B82F6',
  'Tinggi': '#3B82F6',
  'Beresiko Gizi Lebih (Possible Risk of Overweight)': '#3B82F6',
  'Gizi Lebih (Overweight)': '#8B5CF6',
  'Obesitas (Obese)': '#6366F1'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isGuest = user.role === 'tamu';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);


  if (loading) return <div className="animate-fade-in"><p>Loading dashboard...</p></div>;
  if (!stats) return <div>Failed to load dashboard data. Is the backend running?</div>;

  // Calculate critical stats
  const stuntingCount = stats.statistikTBU
    ? stats.statistikTBU
      .filter(item => item.status.includes('Pendek') || item.status.includes('Stunted'))
      .reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  const underweightCount = stats.statistikBBU
    ? stats.statistikBBU
      .filter(item => item.status.includes('Kurang') || item.status.includes('Underweight') || item.status.includes('Buruk'))
      .reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan status gizi balita bulan ini (Standar WHO 2026)</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <Users size={32} color="var(--primary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL BALITA</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{stats.totalBalita ?? 0}</h2>
          </div>
        </div>

        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <Activity size={32} color="var(--secondary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>PENGUKURAN BULAN INI</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{stats.totalPengukuranBulanIni ?? 0}</h2>
          </div>
        </div>

        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <AlertTriangle size={32} color="var(--warning)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>STUNTING (TB/U)</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{stuntingCount} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>anak</span></h2>
          </div>
        </div>

        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <Heart size={32} color="var(--danger)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>GIZI KURANG/BURUK (BB/U)</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{underweightCount} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>anak</span></h2>
          </div>
        </div>
      </div>

      {/* Tata Cara & Panduan Posyandu (Alur 5 Meja & Panduan Tamu) */}
      <div style={{ marginTop: '2rem' }}>
        <PanduanTataCaraTamu isGuest={isGuest} />
      </div>

      {/* Grafik Statistik (Hanya untuk Kader / Admin, disembunyikan untuk Tamu) */}
      {!isGuest && (
        <>
          <div style={{ marginTop: '1rem' }} className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Distribusi Berat Badan / Umur (BB/U)</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statistikBBU}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {stats.statistikBBU.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#CBD5E1'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Distribusi Tinggi Badan / Umur (TB/U)</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.statistikTBU} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fill: isDark ? '#ffffff' : '#000000' }} />
                    <YAxis dataKey="status" type="category" width={120} tick={{ fontSize: 12, fill: isDark ? '#ffffff' : '#000000' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#ffffff', 
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                      itemStyle={{ color: isDark ? '#ffffff' : '#000000' }}
                      labelStyle={{ color: isDark ? '#9CA3AF' : '#4B5563' }}
                      formatter={(value) => [`${value} anak`, 'Jumlah']}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                      {stats.statistikTBU.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || 'var(--primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Distribusi Berat Badan / Tinggi Badan (BB/TB)</h3>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.statistikBBTB} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: isDark ? '#ffffff' : '#000000' }} interval={0} angle={-10} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} tick={{ fill: isDark ? '#ffffff' : '#000000' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#ffffff', 
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                      itemStyle={{ color: isDark ? '#ffffff' : '#000000' }}
                      labelStyle={{ color: isDark ? '#9CA3AF' : '#4B5563' }}
                      formatter={(value) => [`${value} anak`, 'Jumlah']}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                      {stats.statistikBBTB.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || 'var(--primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
