import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const confirm = useCallback((message, onConfirm, onCancel, confirmText = 'Ya, Hapus', type = 'danger') => {
    setConfirmState({ message, onConfirm, onCancel, confirmText, type });
  }, []);

  const handleConfirm = () => {
    if (confirmState && confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    setConfirmState(null);
  };

  const handleCancel = () => {
    if (confirmState && confirmState.onCancel) {
      confirmState.onCancel();
    }
    setConfirmState(null);
  };

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    confirm,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {confirmState && (
        <ConfirmModal 
          message={confirmState.message} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel} 
          confirmText={confirmState.confirmText}
          type={confirmState.type}
        />
      )}
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { message, type } = toast;

  const config = {
    success: {
      text: '#F8FAFC',
      icon: <CheckCircle2 size={20} color="#10B981" />,
      progressBar: '#10B981',
    },
    error: {
      text: '#F8FAFC',
      icon: <AlertCircle size={20} color="#EF4444" />,
      progressBar: '#EF4444',
    },
    warning: {
      text: '#F8FAFC',
      icon: <AlertTriangle size={20} color="#F59E0B" />,
      progressBar: '#F59E0B',
    },
    info: {
      text: '#F8FAFC',
      icon: <Info size={20} color="#3B82F6" />,
      progressBar: '#3B82F6',
    },
  }[type];

  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '0.85rem 1.15rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        color: '#F8FAFC',
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden',
        animation: 'toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '1px' }}>{config.icon}</div>
      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: '1.4', fontWeight: 500 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s',
          marginTop: '1px',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
        }}
      >
        <X size={14} />
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: config.progressBar,
          width: '100%',
          transformOrigin: 'left',
          animation: `toast-progress ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  );
};

const ConfirmModal = ({ message, onConfirm, onCancel, confirmText = 'Ya, Hapus', type = 'danger' }) => {
  const isDanger = type === 'danger';
  const iconBg = isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)';
  const iconColor = isDanger ? '#EF4444' : 'var(--primary)';
  const buttonClass = isDanger ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fade-in 0.2s ease-out forwards',
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--glass-shadow)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'confirm-scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={28} color={iconColor} />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 600 }}>
          Konfirmasi Tindakan
        </h3>
        <p style={{ margin: '0 0 1.75rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.7rem' }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={buttonClass}
            style={{ flex: 1, padding: '0.7rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
