'use client';

import AddMemberForm from '@/components/add-member-form';
import { useUser } from '@/context/user-context';
import Link from 'next/link';
import { User } from '@/types';

export default function AdminPage() {
  const { members } = useUser();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title-gradient" style={{ margin: 0 }}>Manage Team</h1>
        <Link href="/standups" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          ← Back to Standups
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* List of Members */}
        <div className="glass-card">
          <h3>Current Team Members</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {members.length === 0 ? (
                <li style={{ color: 'var(--muted)' }}>No members yet.</li>
            ) : (
                members.map((member: User) => (
                <li key={member.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                    <strong>{member.name}</strong> <span style={{fontSize:'0.8em', color:'var(--muted)'}}>({member.region})</span>
                    </span>
                    <span style={{ 
                        background: member.role === 'admin' ? 'var(--primary)' : 'var(--secondary)', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem',
                        color: 'white'
                    }}>
                    {member.role}
                    </span>
                </li>
                ))
            )}
          </ul>
        </div>

        {/* Add Member Form */}
        <div>
           <AddMemberForm />
        </div>

      </div>
    </div>
  );
}
