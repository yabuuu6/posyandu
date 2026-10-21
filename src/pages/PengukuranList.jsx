import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPengukuran, deletePengukuran } from '../services/api';
import { Plus, FileSpreadsheet, Search, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useToast } from '../components/Toast';

const PengukuranList = () => {
  const toast = useToast();
  const [pengukuranList, setPengukuranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isGuest = user.role === 'tamu';

  const fetchPengukuran = async () => {
    setLoading(true);
    try {
      const data = await getPengukuran({ latest: true });
      setPengukuranList(data || []);
    } catch (error) {
      console.error('Error fetching pengukuran data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengukuran();
  }, []);

  const getBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('baik') || s.includes('normal')) return 'badge badge-success';
    if (s.includes('buruk') || s.includes('sangat pendek') || s.includes('obesitas')) return 'badge badge-danger';
    if (s.includes('kurang') || s.includes('pendek') || s.includes('beresiko') || s.includes('lebih')) return 'badge badge-warning';
    return 'badge badge-info';
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Memastikan hanya 1 data pengukuran terakhir dari setiap balita
  const baseData = (() => {
    const latestMap = new Map();
    pengukuranList.forEach(item => {
      const current = latestMap.get(item.balita_id);
      if (!current) {
        latestMap.set(item.balita_id, item);
      } else {
        const currentDate = new Date(current.tanggal_ukur);
        const itemDate = new Date(item.tanggal_ukur);
        if (itemDate > currentDate || (itemDate.getTime() === currentDate.getTime() && item.id > current.id)) {
          latestMap.set(item.balita_id, item);
        }
      }
    });
    return Array.from(latestMap.values());
  })();

  const filteredData = baseData
    .filter(p => {
      const matchesSearch = (p.nama_balita || '').toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const bbtb = (p.status_bbtb || '').toLowerCase();
        if (statusFilter === 'Normal') {
          matchesStatus = bbtb.includes('normal') || bbtb.includes('baik');
        } else if (statusFilter === 'Gizi Kurang') {
          matchesStatus = bbtb.includes('kurang') || (bbtb.includes('wasted') && !bbtb.includes('severely') && !bbtb.includes('buruk'));
        } else if (statusFilter === 'Gizi Buruk') {
          matchesStatus = bbtb.includes('buruk') || bbtb.includes('severely');
        } else if (statusFilter === 'Gizi Lebih') {
          matchesStatus = bbtb.includes('lebih') || bbtb.includes('overweight') || bbtb.includes('obes') || bbtb.includes('risk');
        }
      }
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.nama_balita || '').localeCompare(b.nama_balita || '', 'id', { sensitivity: 'base' }));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleDelete = (id) => {
    toast.confirm('Yakin ingin menghapus data pengukuran ini?', async () => {
      try {
        await deletePengukuran(id);
        toast.success('Berhasil menghapus data pengukuran');
        fetchPengukuran();
      } catch (error) {
        console.error('Error deleting pengukuran:', error);
        toast.error('Gagal menghapus data pengukuran');
      }
    });
  };

  const handleExport = () => {
    const url = `http://localhost:3000/api/export/pengukuran?search=${encodeURIComponent(search)}&latest=true`;
    window.location.href = url;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            Pengukuran Terakhir Balita
          </h1>
          <p className="page-subtitle">
            Menampilkan data pengukuran terbaru dari setiap balita
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleExport} className="btn btn-secondary">
            <FileSpreadsheet size={18} /> Ekspor Excel
          </button>
          {!isGuest && (
            <Link to="/pengukuran/tambah" className="btn btn-primary">
              <Plus size={18} /> Input Pengukuran (WHO)
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        {/* Header toolbar: Status filter, and search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>Daftar Pengukuran Terakhir</h3>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Gizi Filter */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <button 
                type="button"
                className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: statusFilter === 'all' ? 'var(--primary)' : 'transparent',
                  color: statusFilter === 'all' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </button>
              <button 
                type="button"
                className={`btn ${statusFilter === 'Normal' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: statusFilter === 'Normal' ? 'var(--primary)' : 'transparent',
                  color: statusFilter === 'Normal' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: statusFilter === 'Normal' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setStatusFilter('Normal')}
              >
                Normal
              </button>
              <button 
                type="button"
                className={`btn ${statusFilter === 'Gizi Kurang' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: statusFilter === 'Gizi Kurang' ? 'var(--primary)' : 'transparent',
                  color: statusFilter === 'Gizi Kurang' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: statusFilter === 'Gizi Kurang' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setStatusFilter('Gizi Kurang')}
              >
                Gizi Kurang
              </button>
              <button 
                type="button"
                className={`btn ${statusFilter === 'Gizi Buruk' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: statusFilter === 'Gizi Buruk' ? 'var(--primary)' : 'transparent',
                  color: statusFilter === 'Gizi Buruk' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: statusFilter === 'Gizi Buruk' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setStatusFilter('Gizi Buruk')}
              >
                Gizi Buruk
              </button>
              <button 
                type="button"
                className={`btn ${statusFilter === 'Gizi Lebih' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: statusFilter === 'Gizi Lebih' ? 'var(--primary)' : 'transparent',
                  color: statusFilter === 'Gizi Lebih' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: statusFilter === 'Gizi Lebih' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setStatusFilter('Gizi Lebih')}
              >
                Gizi Lebih
              </button>
            </div>
            {/* Search */}
            <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Cari nama balita..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', padding: '0.5rem', background: 'transparent', outline: 'none', color: 'var(--text-main)' }}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <p style={{ padding: '1rem' }}>Memuat data...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>No</th>
                  <th>Tanggal Ukur</th>
                  <th>Nama Balita</th>
                  <th>BB (kg)</th>
                  <th>TB (cm)</th>
                  <th>Status BB/U</th>
                  <th>Status TB/U</th>
                  <th>Status BB/TB</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {startIndex + idx + 1}
                    </td>
                    <td>
                      <span>{new Date(p.tanggal_ukur).toLocaleDateString('id-ID')}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.nama_balita}</span>
                    </td>
                    <td><strong>{p.berat_badan}</strong></td>
                    <td><strong>{p.tinggi_badan}</strong></td>
                    <td>
                      <span className={getBadgeClass(p.status_bbu)}>{p.status_bbu}</span>
                    </td>
                    <td>
                      <span className={getBadgeClass(p.status_tbu)}>{p.status_tbu}</span>
                    </td>
                    <td>
                      <span className={getBadgeClass(p.status_bbtb)}>{p.status_bbtb}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {isGuest ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        ) : (
                          <>
                            <Link to={`/pengukuran/edit/${p.id}`} className="btn-icon" title="Edit" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <Pencil size={18} color="var(--primary)" />
                            </Link>
                            <button type="button" className="btn-icon" onClick={() => handleDelete(p.id)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <Trash2 size={18} color="var(--danger)" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data pengukuran / tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!loading && totalItems > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Menampilkan <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> dari <strong>{totalItems}</strong> pengukuran (10 per halaman)
            </div>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  title="Halaman Pertama"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button 
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-btn ${safeCurrentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button 
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  title="Halaman Terakhir"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PengukuranList;
