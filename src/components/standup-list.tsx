'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';
import { Standup } from '@/types';

interface StandupListProps {
  refreshTrigger: number;
  selectedDate: string;
  selectedRegion: string;
}

export default function StandupList({ refreshTrigger, selectedDate, selectedRegion }: StandupListProps) {
  const { currentUser } = useUser();
  const [standups, setStandups] = useState<Standup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to check permissions
  // "The team member other than the admin should be able to view and edit only their update but can only view updates of other members in the past date"
  // Implication: 
  // - Today: I see ONLY mine (unless Admin).
  // - Past: I see EVERYONE.
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchStandups = async () => {
      setIsLoading(true);
      try {
        // We fetch ALL for the date, then filter in UI (or we could filter in API).
        // Since API logic is complex, let's pass date and handle logic here mainly for display.
        const res = await fetch(`/api/standups?date=${selectedDate}`);
        if (res.ok) {
          const data: Standup[] = await res.json();
          setStandups(data);
        }
      } catch (error) {
        console.error('Failed to fetch standups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandups();
  }, [selectedDate, refreshTrigger]);

  // Client-side filtering for Region and Permissions
  const filteredStandups = standups.filter(standup => {
    // 1. Region Filter
    if (selectedRegion) {
        // Find the member for this standup to check region
        // We can use the 'users' join from API or look up in 'members' context
        // API returns 'region' now (checked route.js)
        if (standup.region !== selectedRegion) return false;
    }

    // 2. Permission Filter
    if (isToday && !isAdmin) {
        // If today and not admin, only show MY standup
        // If I am not logged in, I effectively see nothing for today
        if (!currentUser || standup.user_id !== currentUser.id) {
            return false;
        }
    }

    return true;
  });

  if (isLoading) return <div className="loading-spinner"></div>;

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>
        Updates for {new Date(selectedDate).toLocaleDateString()}
        {selectedRegion && <span style={{fontSize: '0.8em', color: 'var(--muted)', marginLeft: '10px'}}>({selectedRegion})</span>}
      </h2>

      {filteredStandups.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
          {isToday && !currentUser 
            ? "Please select a user to see/post updates." 
            : isToday && !isAdmin 
                ? "You can only see your own updates for today." 
                : "No standups found for this criteria."}
        </div>
      ) : (
        filteredStandups.map((standup) => (
          <div key={standup.id} className="standup-item">
            <div className="standup-header">
              <span className="user-name">
                  {standup.user_name} 
                  <span style={{ fontSize: '0.8em', color: 'var(--muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                     ({standup.region})
                  </span>
              </span>
              <span className="standup-date">
                {standup.created_at ? new Date(standup.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            
            {standup.yesterday && (
              <div className="standup-section">
                <h4>Yesterday</h4>
                <div dangerouslySetInnerHTML={{ __html: standup.yesterday }} />
              </div>
            )}
            
            {standup.today && (
              <div className="standup-section">
                <h4>Today</h4>
                 <div dangerouslySetInnerHTML={{ __html: standup.today }} />
              </div>
            )}
            
            {standup.blockers && (
              <div className="standup-section">
                <h4>Blockers</h4>
                 <div dangerouslySetInnerHTML={{ __html: standup.blockers }} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
