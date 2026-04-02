import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import ToastContainer from '../feedback/Toast';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
