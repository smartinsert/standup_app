'use client';

import { useUser } from '@/context/user-context';

interface CalendarFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export default function CalendarFilter({ selectedDate, onDateChange, selectedRegion, onRegionChange }: CalendarFilterProps) {
  const { members, currentUser, login } = useUser();

  // Get unique regions from members
  const regions = Array.from(new Set(members.map(m => m.region)));

  return (
    <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      <div style={{ flex: 1, minWidth: '200px' }}>
        <label>I am...</label>
        <select 
            onChange={(e) => login(e.target.value)} 
            value={currentUser?.id || ''}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)' }}
          >
            <option value="">-- Select Member --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.region}) {m.role === 'admin' ? '★' : ''}
              </option>
            ))}
          </select>
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <label>Date</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]} 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <label>Filter Region</label>
        <select 
          value={selectedRegion} 
          onChange={(e) => onRegionChange(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border)' }}
        >
          <option value="">All Regions</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
