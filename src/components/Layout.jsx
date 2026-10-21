import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
