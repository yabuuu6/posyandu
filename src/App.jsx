import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BalitaList from './pages/BalitaList';
import BalitaCreate from './pages/BalitaCreate';
import BalitaEdit from './pages/BalitaEdit';
import PengukuranList from './pages/PengukuranList';
import PengukuranCreate from './pages/PengukuranCreate';
import PengukuranEdit from './pages/PengukuranEdit';
import Login from './pages/Login';
import { ToastProvider } from './components/Toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="balita" element={<BalitaList />} />
            <Route path="balita/tambah" element={<BalitaCreate />} />
            <Route path="balita/edit/:id" element={<BalitaEdit />} />
            <Route path="pengukuran" element={<PengukuranList />} />
            <Route path="pengukuran/tambah" element={<PengukuranCreate />} />
            <Route path="pengukuran/edit/:id" element={<PengukuranEdit />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
