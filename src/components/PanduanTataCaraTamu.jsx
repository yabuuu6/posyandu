import { useState } from 'react';
import { 
  ClipboardList, Scale, FileText, Apple, HeartPulse, 
  BookOpen, HelpCircle, CheckCircle2, ChevronRight, 
  TrendingUp, Download, Users, Info, ChevronDown, ChevronUp
} from 'lucide-react';

const ALUR_5_MEJA = [
  {
    nomor: '1',
    nama: 'Meja 1: Pendaftaran',
    petugas: 'Kader Posyandu',
    deskripsi: 'Pendaftaran balita, ibu hamil, dan penyerahan buku KIA (Kesehatan Ibu dan Anak) atau KMS.',
    detail: 'Kader mencatat biodata balita, memeriksa kehadiran rutin, dan memastikan data identitas lengkap.',
    icon: ClipboardList,
    warna: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.1)'
  },
  {
    nomor: '2',
    nama: 'Meja 2: Penimbangan & Pengukuran',
    petugas: 'Kader Posyandu',
    deskripsi: 'Penimbangan berat badan (BB) serta pengukuran panjang atau tinggi badan (TB) balita.',
    detail: 'Menggunakan timbangan digital / dacin berkalibrasi dan infantometer/stadiometer standar Kemenkes.',
    icon: Scale,
    warna: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)'
  },
  {
    nomor: '3',
    nama: 'Meja 3: Pencatatan Digital',
    petugas: 'Kader Posyandu',
    deskripsi: 'Penginputan hasil pengukuran ke sistem digital TumbuhCeria dan buku KIA.',
    detail: 'Sistem secara otomatis menghitung Z-Score WHO untuk mengetahui status gizi balita secara real-time.',
    icon: FileText,
    warna: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.1)'
  },
  {
    nomor: '4',
    nama: 'Meja 4: Penyuluhan & Edukasi Gizi',
    petugas: 'Kader & Tim Gizi',
    deskripsi: 'Konseling pola makan balita, edukasi MP-ASI bergizi, PMT, dan pencegahan stunting.',
    detail: 'Memberikan bimbingan kepada orang tua berdasarkan grafik pertumbuhan balita pada bulan berjalan.',
    icon: Apple,
    warna: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)'
  },
  {
    nomor: '5',
    nama: 'Meja 5: Pelayanan Medis & Imunisasi',
    petugas: 'Bidan / Petugas Puskesmas',
    deskripsi: 'Pemberian imunisasi dasar, vitamin A, obat cacing, dan rujukan nakes bila diperlukan.',
    detail: 'Pemeriksaan kesehatan klinis oleh tenaga kesehatan profesional jika ditemukan balita berisiko stunting.',
    icon: HeartPulse,
    warna: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.1)'
  }
];

const PANDUAN_TAMU = [
  {
    langkah: '1',
    judul: 'Mempelajari Alur Pelayanan Posyandu',
    penjelasan: 'Pelajari tata cara alur 5 meja pelayanan posyandu mulai dari pendaftaran, penimbangan, pencatatan KMS, edukasi gizi, hingga pelayanan medis dan imunisasi.',
    icon: ClipboardList,
    badge: 'Alur Layanan'
  },
  {
    langkah: '2',
    judul: 'Memahami Indikator Status Gizi WHO',
    penjelasan: 'Pahami 3 indikator antropometri standar: BB/U (bobot usia), TB/U (deteksi stunting), dan BB/TB (deteksi kurus/wasting). Riwayat status gizi individual dapat ditinjau pada menu Data Balita.',
    icon: BookOpen,
    badge: 'Standar WHO'
  },
  {
    langkah: '3',
    judul: 'Melihat Data Lengkap Balita',
    penjelasan: 'Buka menu Data Balita di bilah samping. Anda dapat mencari nama balita tertentu, menyaring jenis kelamin, dan menekan tombol Riwayat untuk melihat riwayat pengukuran.',
    icon: Users,
    badge: 'Data Balita'
  },
  {
    langkah: '4',
    judul: 'Meninjau Riwayat Pengukuran & Ekspor',
    penjelasan: 'Buka menu Pengukuran (WHO) untuk melihat catatan antropometri terbaru dari setiap balita. Anda juga dapat mengklik Ekspor Excel untuk mengunduh laporan rekapitulasi data posyandu.',
    icon: Download,
    badge: 'Ekspor'
  }
];

const KAMUS_WHO = [
  {
    indikator: 'BB/U (Berat menurut Umur)',
    tujuan: 'Menilai berat badan balita relatif terhadap usianya.',
    kategori: [
      { nama: 'Gizi Buruk', ambang: '< -3 SD', warna: '#EF4444' },
      { nama: 'Gizi Kurang', ambang: '-3 SD s/d -2 SD', warna: '#F59E0B' },
      { nama: 'Gizi Baik (Normal)', ambang: '-2 SD s/d +1 SD', warna: '#10B981' },
      { nama: 'Risiko BB Lebih', ambang: '> +1 SD', warna: '#3B82F6' }
    ]
  },
  {
    indikator: 'TB/U (Tinggi menurut Umur)',
    tujuan: 'Menilai stunting (gangguan pertumbuhan kronis akibat malnutrisi jangka panjang).',
    kategori: [
      { nama: 'Sangat Pendek (Severely Stunted)', ambang: '< -3 SD', warna: '#EF4444' },
      { nama: 'Pendek (Stunted)', ambang: '-3 SD s/d -2 SD', warna: '#F59E0B' },
      { nama: 'Normal', ambang: '-2 SD s/d +3 SD', warna: '#10B981' },
      { nama: 'Tinggi', ambang: '> +3 SD', warna: '#3B82F6' }
    ]
  },
  {
    indikator: 'BB/TB (Berat menurut Tinggi)',
    tujuan: 'Menilai wasting (kurus akut / malnutrisi mendadak) atau obesitas.',
    kategori: [
      { nama: 'Gizi Buruk (Severely Wasted)', ambang: '< -3 SD', warna: '#EF4444' },
      { nama: 'Gizi Kurang (Wasted)', ambang: '-3 SD s/d -2 SD', warna: '#F59E0B' },
      { nama: 'Gizi Baik (Normal)', ambang: '-2 SD s/d +1 SD', warna: '#10B981' },
      { nama: 'Beresiko Gizi Lebih', ambang: '+1 SD s/d +2 SD', warna: '#3B82F6' },
      { nama: 'Gizi Lebih (Overweight)', ambang: '+2 SD s/d +3 SD', warna: '#8B5CF6' },
      { nama: 'Obesitas (Obese)', ambang: '> +3 SD', warna: '#6366F1' }
    ]
  }
];

const PanduanTataCaraTamu = ({ isGuest = true }) => {
  const [activeTab, setActiveTab] = useState('alur'); // 'alur' | 'panduan' | 'kamus'
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="card glass" style={{
      marginBottom: '2rem',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(16, 185, 129, 0.02) 100%), var(--surface)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Tata Cara */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Tata Cara & Panduan Posyandu</span>
              {isGuest && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#d97706'
                }}>
                  Khusus Tamu
                </span>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Petunjuk alur 5 meja posyandu, cara penggunaan portal tamu, dan pedoman Z-Score WHO.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} /> Ciutkan Panduan
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Buka Panduan Lengkap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Konten Terbuka */}
      {isExpanded && (
        <div style={{ padding: '1.5rem' }}>
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: 'var(--surface-hover)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              className={`btn ${activeTab === 'alur' ? 'btn-primary' : ''}`}
              style={{
                flex: '1 1 180px',
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem',
                minHeight: 'auto',
                border: 'none',
                background: activeTab === 'alur' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'alur' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={() => setActiveTab('alur')}
            >
              <Scale size={16} /> Alur 5 Meja Posyandu
            </button>

            <button
              type="button"
              className={`btn ${activeTab === 'panduan' ? 'btn-primary' : ''}`}
              style={{
                flex: '1 1 180px',
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem',
                minHeight: 'auto',
                border: 'none',
                background: activeTab === 'panduan' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'panduan' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={() => setActiveTab('panduan')}
            >
              <HelpCircle size={16} /> Cara Pakai Mode Tamu
            </button>

            <button
              type="button"
              className={`btn ${activeTab === 'kamus' ? 'btn-primary' : ''}`}
              style={{
                flex: '1 1 180px',
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem',
                minHeight: 'auto',
                border: 'none',
                background: activeTab === 'kamus' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'kamus' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={() => setActiveTab('kamus')}
            >
              <Info size={16} /> Kamus Z-Score WHO
            </button>
          </div>

          {/* Tab 1: Alur 5 Meja Posyandu */}
          {activeTab === 'alur' && (
            <div className="animate-fade-in">
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)'
              }}>
                <Info size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Alur 5 Meja</strong> adalah prosedur standar operasional pelayanan Posyandu di Indonesia yang bertujuan memantau tumbuh kembang serta mencegah stunting sejak dini.
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem'
              }}>
                {ALUR_5_MEJA.map((meja) => {
                  const Icon = meja.icon;
                  return (
                    <div
                      key={meja.nomor}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: meja.bg,
                          color: meja.warna,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={20} />
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '8px',
                          background: 'var(--surface-hover)',
                          color: 'var(--text-muted)'
                        }}>
                          {meja.petugas}
                        </span>
                      </div>

                      <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '0.98rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        {meja.nama}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 500 }}>
                        {meja.deskripsi}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {meja.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Tata Cara Penggunaan Mode Tamu */}
          {activeTab === 'panduan' && (
            <div className="animate-fade-in">
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)'
              }}>
                <CheckCircle2 size={18} color="var(--secondary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Mode Tamu (Read-Only)</strong> dirancang agar pemerhati kesehatan, mahasiswa, dan masyarakat dapat meninjau data posyandu secara transparan tanpa khawatir mengubah data kader.
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {PANDUAN_TAMU.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.langkah}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
                          {item.langkah}
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '8px',
                          background: 'var(--surface-hover)',
                          color: 'var(--primary)'
                        }}>
                          {item.badge}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.judul}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {item.penjelasan}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Kamus Standar WHO Z-Score */}
          {activeTab === 'kamus' && (
            <div className="animate-fade-in">
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)'
              }}>
                <Info size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Z-Score (Standar WHO & Kemenkes RI)</strong> mengukur deviasi standar pertumbuhan anak terhadap populasi referensi anak sehat sedunia.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {KAMUS_WHO.map((k) => (
                  <div
                    key={k.indikator}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        {k.indikator}
                      </h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {k.tujuan}
                      </p>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.5rem'
                    }}>
                      {k.kategori.map((cat, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-hover)',
                            borderLeft: `4px solid ${cat.warna}`,
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.nama}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{cat.ambang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanduanTataCaraTamu;
