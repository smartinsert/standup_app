'use client';

import { useState } from 'react';
import { useUser } from '@/context/user-context';

export default function LoginScreen() {
  const { members, login } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !password) {
      setError('Please select a user and enter a password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await login(Number(selectedUserId), password);
    
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#logo-grad)" strokeWidth="2"/>
              <path d="M9 3V21" stroke="url(#logo-grad)" strokeWidth="2"/>
              <defs>
                <linearGradient id="logo-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6"/>
                  <stop offset="1" stopColor="#38bdf8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Please sign in to your team account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Member</label>
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="login-input"
            >
              <option value="">-- Select your name --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="primary-btn login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="login-footer">
            <p>Default password is <code>password123</code></p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          animation: fadeIn 0.5s ease-out;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-header p {
          color: var(--muted);
          font-size: 0.95rem;
        }
        .login-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .login-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          outline: none;
        }
        .login-btn {
          margin-top: 1rem;
          padding: 1rem;
          font-size: 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        .login-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          text-align: center;
        }
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--muted);
        }
        code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          color: var(--accent);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
