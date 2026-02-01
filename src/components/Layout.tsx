import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { translateUserRole } from '../utils/translations';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <Link to="/" className="layout-logo">
            🌱 GardenMate
          </Link>
          <nav className="layout-nav">
            <Link to="/" className="nav-link">
              Mes Plantes
            </Link>
            <Link to="/plants" className="nav-link">
              Catalogue
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
            )}
          </nav>
          <div className="layout-user">
            <span className="user-info">
              {user?.login} ({translateUserRole(user?.role || '')})
            </span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
};
