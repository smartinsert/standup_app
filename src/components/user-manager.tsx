'use client';

import { useUser } from '@/context/user-context';
import Link from 'next/link';

export default function UserManager() {
  const { currentUser, members, login } = useUser();

  const handleLoginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    login(e.target.value);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* User Switcher */}
        <div style={{ flex: 1 }}>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>Current User (Simulate Login)</label>
          <select 
            onChange={handleLoginChange} 
            value={currentUser?.id || ''}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)' }}
          >
            <option value="">-- Select User --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.region}) {m.role === 'admin' ? '★' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Admin Link */}
        <Link href="/admin">
          <button 
            style={{ padding: '0.5rem 1rem', background: 'var(--secondary)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Manage Team
          </button>
        </Link>
      </div>
    </div>
  );
}
