import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Shield } from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/projects', icon: <FolderKanban size={18} />, label: 'Projects' },
    { to: '/tasks', icon: <CheckSquare size={18} />, label: 'Tasks' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🚀</div>
          <span>TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="name truncate">{user?.name}</div>
              <div className="role-badge flex items-center gap-2">
                {isAdmin && <Shield size={10} />}{user?.role}
              </div>
            </div>
          </div>
          <button className="nav-item btn-ghost" onClick={handleLogout} style={{ marginTop: 4 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
