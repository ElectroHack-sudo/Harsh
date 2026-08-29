import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Sparkles,
  BarChart3,
  Calendar,
  Image,
  Link2,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create', label: 'Create Content', icon: PlusCircle },
  { path: '/library', label: 'Content Library', icon: FolderOpen },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/media', label: 'Media Library', icon: Image },
  { path: '/accounts', label: 'Connected Accounts', icon: Link2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Layout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#7c3aed'
          }}>
            C
          </div>
          {sidebarOpen && (
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>CreatorHub</span>
          )}
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.25rem',
                  borderRadius: '8px',
                  background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{
              position: 'relative',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280'
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#7c3aed',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'C'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Creator</span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>Creator</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '0.875rem'
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          background: '#f9fafb'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;