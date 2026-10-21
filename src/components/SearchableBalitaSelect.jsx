import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, User, Calendar } from 'lucide-react';

const SearchableBalitaSelect = ({ balitaList = [], selectedId, onSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedBalita = balitaList.find(b => String(b.id) === String(selectedId));

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter balita berdasarkan query pencarian (nama atau nama orang tua)
  const filteredList = balitaList.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchNama = b.nama?.toLowerCase().includes(query);
    const matchOrtu = b.nama_orang_tua?.toLowerCase().includes(query);
    return matchNama || matchOrtu;
  });

  const handleSelect = (b) => {
    onSelect(b);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  return (
    <div className="searchable-balita-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Box Tampilan Terpilih / Pemicu Dropdown */}
      {!isOpen && selectedBalita ? (
        <div 
          onClick={handleOpenDropdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: error ? '0 0 0 1px var(--danger)' : 'none'
          }}
          title="Klik untuk mencari atau mengganti balita"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: selectedBalita.jenis_kelamin === 'L' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(236, 72, 153, 0.12)',
              color: selectedBalita.jenis_kelamin === 'L' ? '#3B82F6' : '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              flexShrink: 0
            }}>
              {selectedBalita.jenis_kelamin === 'L' ? 'L' : 'P'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {selectedBalita.nama}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)'
                }}>
                  {selectedBalita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Lahir: {new Date(selectedBalita.tanggal_lahir).toLocaleDateString('id-ID')} &bull; Ortu: {selectedBalita.nama_orang_tua}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>Ganti</span>
            <ChevronDown size={18} />
          </div>
        </div>
      ) : (
        /* Input Pencarian saat dropdown aktif atau belum ada yang terpilih */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--primary)',
          backgroundColor: 'var(--surface)',
          boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)'
        }}>
          <Search size={18} color="var(--primary)" style={{ marginRight: '0.6rem', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik nama balita atau orang tua untuk mencari..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              width: '100%',
              fontSize: '0.95rem'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Menu Dropdown Hasil Pencarian */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.4rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          maxHeight: '280px',
          overflowY: 'auto',
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{
            padding: '0.5rem 0.85rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-hover)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Ditemukan <strong>{filteredList.length}</strong> balita</span>
            <span>Ketik untuk menyaring</span>
          </div>

          {filteredList.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tidak ada balita yang cocok dengan <em>"{searchQuery}"</em>
            </div>
          ) : (
            filteredList.map((b) => {
              const isSelected = String(b.id) === String(selectedId);
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelect(b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: b.jenis_kelamin === 'L' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                      color: b.jenis_kelamin === 'L' ? '#3B82F6' : '#EC4899',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {b.jenis_kelamin === 'L' ? 'L' : 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {b.nama}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Lahir: {new Date(b.tanggal_lahir).toLocaleDateString('id-ID')} &bull; Ortu: {b.nama_orang_tua}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={18} color="var(--primary)" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableBalitaSelect;
