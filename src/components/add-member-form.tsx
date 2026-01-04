'use client';

import { useState, FormEvent } from 'react';
import { useUser } from '@/context/user-context';
import { Region } from '@/types';

interface NewMember {
  name: string;
  region: Region;
  role: 'member' | 'admin';
}

export default function AddMemberForm() {
  const { refreshMembers } = useUser();
  const [newMember, setNewMember] = useState<NewMember>({ name: '', region: 'Bengaluru', role: 'member' });

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        setNewMember({ name: '', region: 'Bengaluru', role: 'member' });
        refreshMembers();
        alert('Member added!');
      } else {
        alert('Failed to add member');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding member');
    }
  };

  return (
    <div className="glass-card">
      <h3>Add New Team Member</h3>
      <form onSubmit={handleAddMember} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            placeholder="Jane Doe" 
            value={newMember.name}
            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Region</label>
          <select 
            value={newMember.region}
            onChange={(e) => setNewMember({...newMember, region: e.target.value as Region})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)' }}
          >
            <option value="Dallas">Dallas</option>
            <option value="New York">New York</option>
            <option value="London">London</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        <div className="form-group">
          <label>Role</label>
           <select 
            value={newMember.role}
            onChange={(e) => setNewMember({...newMember, role: e.target.value as 'member' | 'admin'})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)' }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="primary-btn">Save Member</button>
      </form>
    </div>
  );
}
