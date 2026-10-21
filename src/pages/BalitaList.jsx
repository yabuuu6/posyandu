import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBalita, deleteBalita, createBalitaBulk } from '../services/api';
import { Plus, Trash2, Search, Pencil, FileSpreadsheet, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Activity } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '../components/Toast';
import RiwayatPengukuranModal from '../components/RiwayatPengukuranModal';

const BalitaList = () => {
  const toast = useToast();
  const [balitaList, setBalitaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedBalitaForHistory, setSelectedBalitaForHistory] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isGuest = user.role === 'tamu';

  const fetchBalita = async () => {
    try {
      const data = await getBalita();
      setBalitaList(data);
    } catch (error) {
      console.error('Error fetching balita data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalita();
  }, []);

  const handleDelete = (id) => {
    toast.confirm('Yakin ingin menghapus data balita ini? (Semua data pengukuran terkait juga akan dihapus)', async () => {
      try {
        await deleteBalita(id);
        toast.success('Berhasil menghapus data balita');
        fetchBalita();
      } catch (error) {
        console.error('Error deleting balita:', error);
        toast.error('Gagal menghapus data balita');
      }
    });
  };


  const handleExport = () => {
    const url = `http://localhost:3000/api/export/balita?search=${encodeURIComponent(search)}`;
    window.location.href = url;
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          toast.warning('File Excel kosong atau tidak memiliki data.');
          return;
        }

        // Parse and map columns dynamically
        const formattedList = data.map((row, idx) => {
          const getVal = (keys) => {
            const foundKey = Object.keys(row).find(k => 
              keys.some(key => k.toLowerCase().replace(/[\s\._]/g, '') === key.toLowerCase().replace(/[\s\._]/g, ''))
            );
            return foundKey ? row[foundKey] : null;
          };

          const nama = getVal(['nama', 'namabalita', 'namaanak']);
          let jk = getVal(['jeniskelamin', 'jk', 'j.k']);
          const tglLahirVal = getVal(['tanggallahir', 'tgllahir', 'tanggal']);
          const ortu = getVal(['namaorangtua', 'orangtua', 'ortu', 'bapak', 'ibu']);
          const hp = getVal(['nohp', 'hp', 'no.hp', 'whatsapp', 'telp']);

          if (!nama || !jk || !tglLahirVal || !ortu) {
            throw new Error(`Data pada baris ${idx + 2} kurang lengkap. Pastikan kolom Nama, Jenis Kelamin, Tanggal Lahir, dan Orang Tua terisi.`);
          }

          let jenis_kelamin = 'L';
          if (String(jk).trim().toLowerCase().startsWith('p') || String(jk).trim().toLowerCase().includes('perempuan')) {
            jenis_kelamin = 'P';
          }

          let tanggal_lahir = '';
          try {
            if (typeof tglLahirVal === 'number') {
              const date = new Date((tglLahirVal - 25569) * 86400 * 1000);
              tanggal_lahir = date.toISOString().split('T')[0];
            } else {
              const parts = String(tglLahirVal).split(/[\/\-\.]/);
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  tanggal_lahir = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (parts[2].length === 4) {
                  tanggal_lahir = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }
              
              if (!tanggal_lahir) {
                const date = new Date(tglLahirVal);
                if (!isNaN(date.getTime())) {
                  tanggal_lahir = date.toISOString().split('T')[0];
                }
              }
            }

            if (!tanggal_lahir) throw new Error();
          } catch (e) {
            throw new Error(`Format Tanggal Lahir pada baris ${idx + 2} (${tglLahirVal}) tidak valid. Gunakan format YYYY-MM-DD atau DD/MM/YYYY.`);
          }

          return {
            nama: String(nama).trim(),
            jenis_kelamin,
            tanggal_lahir,
            nama_orang_tua: String(ortu).trim(),
            no_hp: hp ? String(hp).trim() : null
          };
        });

        toast.confirm(`Berhasil membaca ${formattedList.length} data balita dari Excel. Yakin ingin mengimpor data ini ke database?`, async () => {
          setLoading(true);
          try {
            await createBalitaBulk(formattedList);
            toast.success('Sukses mengimpor data balita dari Excel!');
            fetchBalita();
          } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Gagal menyimpan data ke database.');
          } finally {
            setLoading(false);
          }
        }, null, 'Ya, Impor', 'info');
      } catch (err) {
        console.error(err);
        toast.error(`Gagal memproses file Excel: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = balitaList
    .filter(b => {
      const matchesSearch = b.nama.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter === 'all' || b.jenis_kelamin === genderFilter;
      return matchesSearch && matchesGender;
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter]);

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

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Data Balita</h1>
          <p className="page-subtitle">Kelola data peserta Posyandu</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isGuest && (
            <>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
                id="import-excel-file" 
                onChange={handleImportExcel} 
              />
              <button 
                onClick={() => document.getElementById('import-excel-file').click()} 
                className="btn btn-secondary"
                title="Impor data dari Excel"
              >
                <Upload size={18} /> Impor Excel
              </button>
            </>
          )}

          <button onClick={handleExport} className="btn btn-secondary">
            <FileSpreadsheet size={18} /> Ekspor Excel
          </button>

          {!isGuest && (
            <Link to="/balita/tambah" className="btn btn-primary">
              <Plus size={18} /> Tambah Balita
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Daftar Balita</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <button 
                type="button"
                className={`btn ${genderFilter === 'all' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: genderFilter === 'all' ? 'var(--primary)' : 'transparent',
                  color: genderFilter === 'all' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: genderFilter === 'all' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setGenderFilter('all')}
              >
                Semua
              </button>
              <button 
                type="button"
                className={`btn ${genderFilter === 'L' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: genderFilter === 'L' ? 'var(--primary)' : 'transparent',
                  color: genderFilter === 'L' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: genderFilter === 'L' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setGenderFilter('L')}
              >
                Laki-laki
              </button>
              <button 
                type="button"
                className={`btn ${genderFilter === 'P' ? 'btn-primary' : ''}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: 'auto',
                  background: genderFilter === 'P' ? 'var(--primary)' : 'transparent',
                  color: genderFilter === 'P' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: genderFilter === 'P' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setGenderFilter('P')}
              >
                Perempuan
              </button>
            </div>
            <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Cari nama..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', padding: '0.5rem', background: 'transparent', outline: 'none', color: 'var(--text-main)' }}
              />
            </div>
          </div>
        </div>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>💡</span>
          <span>Tip: <strong>Klik pada baris data balita</strong> atau ikon grafik untuk melihat riwayat pengukuran lengkap.</span>
        </p>

        <div className="table-container">
          {loading ? (
            <p style={{ padding: '1rem' }}>Memuat data...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>No</th>
                  <th>Nama Balita</th>
                  <th>Jenis Kelamin</th>
                  <th>Tanggal Lahir</th>
                  <th>Orang Tua</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((b, idx) => (
                  <tr 
                    key={b.id}
                    className="clickable-row"
                    onClick={() => setSelectedBalitaForHistory(b)}
                    title="Klik untuk melihat riwayat pengukuran balita ini"
                  >
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {startIndex + idx + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="balita-name-text">
                          {b.nama}
                        </span>
                        <span 
                          className="badge badge-info" 
                          style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', cursor: 'pointer' }}
                          title="Lihat riwayat pengukuran"
                        >
                          <Activity size={12} /> Riwayat
                        </span>
                      </div>
                    </td>
                    <td>{b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>{new Date(b.tanggal_lahir).toLocaleDateString('id-ID')}</td>
                    <td>{b.nama_orang_tua}</td>
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          type="button" 
                          className="btn-icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBalitaForHistory(b);
                          }} 
                          title="Lihat Riwayat Pengukuran" 
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <Activity size={18} color="var(--primary)" />
                        </button>
                        {!isGuest && (
                          <>
                            <Link 
                              to={`/balita/edit/${b.id}`} 
                              className="btn-icon" 
                              title="Edit" 
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil size={18} color="var(--primary)" />
                            </Link>
                            <button 
                              type="button" 
                              className="btn-icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(b.id);
                              }} 
                              title="Hapus" 
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Trash2 size={18} color="var(--danger)" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data / tidak ditemukan</td>
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
              Menampilkan <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> dari <strong>{totalItems}</strong> balita (10 per halaman)
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

      {selectedBalitaForHistory && (
        <RiwayatPengukuranModal
          balita={selectedBalitaForHistory}
          onClose={() => setSelectedBalitaForHistory(null)}
        />
      )}
    </div>
  );
};

export default BalitaList;
