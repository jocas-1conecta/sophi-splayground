import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/routes';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav glass" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`
          }
        >
          <span className="bottom-nav-emoji">{item.emoji}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
