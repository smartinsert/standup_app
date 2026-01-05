'use client';

import { useUser } from '@/context/user-context';
import { useTheme } from '@/context/theme-context';
import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const { currentUser, logout } = useUser();
  const { theme, setTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!currentUser) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setMessage({ text: 'Password must be at least 4 characters', type: 'error' });
      return;
    }

    setIsChanging(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, newPassword }),
      });

      if (res.ok) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setNewPassword('');
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link href="/standups" className="header-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#h-grad)" strokeWidth="2"/>
            <path d="M9 3V21" stroke="url(#h-grad)" strokeWidth="2"/>
            <defs>
              <linearGradient id="h-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--grad-start)"/>
                <stop offset="1" stopColor="var(--grad-end)"/>
              </linearGradient>
            </defs>
          </svg>
        </Link>

        <div className="header-actions">
          <div className="user-info">
            <span className="user-welcome">Hi, <strong>{currentUser.name}</strong></span>
            <span className="user-role">{currentUser.role}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)} 
              className={`action-btn ${showThemeMenu ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>

            {showThemeMenu && (
              <div className="theme-menu glass-card">
                <button onClick={() => { setTheme('slate'); setShowThemeMenu(false); }} className={`theme-opt ${theme === 'slate' ? 'selected' : ''}`}>
                  <span className="color-dot" style={{ background: '#8b5cf6' }}></span> Slate
                </button>
                <button onClick={() => { setTheme('ocean'); setShowThemeMenu(false); }} className={`theme-opt ${theme === 'ocean' ? 'selected' : ''}`}>
                  <span className="color-dot" style={{ background: '#0ea5e9' }}></span> Ocean
                </button>
                <button onClick={() => { setTheme('sunset'); setShowThemeMenu(false); }} className={`theme-opt ${theme === 'sunset' ? 'selected' : ''}`}>
                  <span className="color-dot" style={{ background: '#ec4899' }}></span> Sunset
                </button>
                <button onClick={() => { setTheme('forest'); setShowThemeMenu(false); }} className={`theme-opt ${theme === 'forest' ? 'selected' : ''}`}>
                  <span className="color-dot" style={{ background: '#10b981' }}></span> Forest
                </button>
                <button onClick={() => { setTheme('light'); setShowThemeMenu(false); }} className={`theme-opt ${theme === 'light' ? 'selected' : ''}`}>
                  <span className="color-dot" style={{ background: '#cbd5e1', border: '1px solid #94a3b8' }}></span> Light
                </button>
              </div>
            )}

            <button onClick={() => { setShowPasswordModal(true); setMessage({ text: '', type: '' }); }} className="action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
            
            <button onClick={logout} className="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="modal-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>
              
              {message.text && (
                <div style={{ 
                  color: message.type === 'success' ? '#10b981' : '#ef4444', 
                  fontSize: '0.85rem', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="primary-btn" disabled={isChanging}>
                  {isChanging ? 'Saving...' : 'Save Password'}
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .main-header {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          height: 64px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          height: 100%;
        }
        .logo-text {
          font-weight: 700;
          font-size: 1.5rem;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: normal;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }
        .user-welcome {
          font-size: 0.9rem;
          color: #fff;
        }
        .user-role {
          font-size: 0.7rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .action-btn, .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          color: var(--muted);
          border: 1px solid var(--border);
          width: 38px;
          height: 38px;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn:hover, .action-btn.active {
          background: rgba(56, 189, 248, 0.1);
          color: var(--accent);
          border-color: rgba(56, 189, 248, 0.2);
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }
        
        .theme-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 160px;
          padding: 0.5rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid var(--accent);
        }
        .theme-opt {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          color: var(--foreground);
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          text-align: left;
          transition: background 0.2s ease;
        }
        .theme-opt:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .theme-opt.selected {
          background: rgba(255, 255, 255, 0.1);
          color: var(--accent);
          font-weight: 600;
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          max-width: 400px;
          width: 100%;
          border: 1px solid var(--accent);
        }
        .modal-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          color: white;
        }
        .modal-input:focus {
          border-color: var(--primary);
          outline: none;
        }
        .cancel-btn {
          flex: 1;
          background: transparent;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </header>
  );
}
