'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';
import { Standup } from '@/types';

interface StandupListProps {
  refreshTrigger: number;
  selectedDate: string;
}

export default function StandupList({ refreshTrigger, selectedDate }: StandupListProps) {
  const { currentUser, members } = useUser();
  const [standups, setStandups] = useState<Standup[]>([]);
  const [localRegion, setLocalRegion] = useState('');
  const [localMemberId, setLocalMemberId] = useState<number | ''>('');
  const [yesterdayStandup, setYesterdayStandup] = useState<Standup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchStandups = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/standups?date=${selectedDate}`);
        if (res.ok) {
          const data: Standup[] = await res.json();
          setStandups(data);
        }

        // Fetch yesterday's update for fallback if no today's update
        if (currentUser) {
          const prevDateObj = new Date(selectedDate);
          prevDateObj.setDate(prevDateObj.getDate() - 1);
          const prevDate = prevDateObj.toISOString().split('T')[0];
          
          const prevRes = await fetch(`/api/standups?userId=${currentUser.id}&date=${prevDate}`);
          if (prevRes.ok) {
            const prevData: Standup[] = await prevRes.json();
            if (prevData.length > 0) {
              setYesterdayStandup(prevData[0]);
            } else {
              setYesterdayStandup(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch standups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandups();
  }, [selectedDate, refreshTrigger, currentUser]);

  const filteredStandups = standups.filter(standup => {
    // Local Region Filter
    if (localRegion && standup.region !== localRegion) return false;
    
    // Local Member Filter
    if (localMemberId && standup.user_id !== localMemberId) return false;

    // Admin/Permission check - Admins see all, members only see their own on today's date
    // (though our split view changes this dynamic, we'll keep the team section restricted for members on today's date)
    if (isToday && !isAdmin) {
      if (!currentUser || standup.user_id !== currentUser.id) {
        return false;
      }
    }

    return true;
  });

  const regions = Array.from(new Set(members.map(m => m.region)));

  if (isLoading) return <div className="loading-spinner"></div>;

  const currentUserUpdate = standups.find(s => s.user_id === currentUser?.id);
  const otherStandups = filteredStandups.filter(s => s.user_id !== currentUser?.id);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Selected Member Status Section */}
      {currentUser && (
        <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>My Status</h2>
            {!currentUserUpdate && yesterdayStandup && (
              <span className="badge" style={{ background: 'var(--secondary)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                Showing Yesterday's Plan
              </span>
            )}
          </div>

          {!currentUserUpdate && !yesterdayStandup ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem' }}>
              No status found for yesterday or today.
            </div>
          ) : (
            <div className="standup-item" style={{ border: 'none', padding: 0, margin: 0 }}>
              <div className="standup-header" style={{ marginBottom: '1rem' }}>
                <span className="user-name">
                  {currentUser.name}
                  <span style={{ fontSize: '0.8em', color: 'var(--muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                    ({currentUser.region})
                  </span>
                </span>
                <span className="standup-date">
                  {(currentUserUpdate || yesterdayStandup)?.created_at ? new Date((currentUserUpdate || yesterdayStandup)!.created_at!).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                </span>
              </div>

              {(currentUserUpdate || yesterdayStandup)?.yesterday && (
                <div className="standup-section">
                  <h4>Yesterday</h4>
                  <div dangerouslySetInnerHTML={{ __html: (currentUserUpdate || yesterdayStandup)!.yesterday }} />
                </div>
              )}

              {(currentUserUpdate || yesterdayStandup)?.today && (
                <div className="standup-section">
                  <h4>{currentUserUpdate ? 'Today' : "Plan from Yesterday"}</h4>
                  <div dangerouslySetInnerHTML={{ __html: (currentUserUpdate || yesterdayStandup)!.today }} />
                </div>
              )}

              {(currentUserUpdate || yesterdayStandup)?.blockers && (
                <div className="standup-section">
                  <h4>Blockers</h4>
                  <div dangerouslySetInnerHTML={{ __html: (currentUserUpdate || yesterdayStandup)!.blockers }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Team Updates Section */}
      <div className="glass-card team-updates-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Team Updates</h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select 
              value={localRegion} 
              onChange={(e) => setLocalRegion(e.target.value)}
              className="local-filter"
            >
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select 
              value={localMemberId} 
              onChange={(e) => setLocalMemberId(Number(e.target.value) || '')}
              className="local-filter"
            >
              <option value="">All Members</option>
              {members
                .filter(m => m.id !== currentUser?.id)
                .filter(m => localRegion ? m.region === localRegion : true)
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="scroll-container">
          {otherStandups.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
              {isToday && !isAdmin
                ? "You can only see your own updates for today."
                : "No team updates found for the selected filters."}
            </div>
          ) : (
            otherStandups.map((standup) => (
              <div key={standup.id} className="standup-item">
                <div className="standup-header">
                  <span className="user-name">
                    {standup.user_name}
                    <span style={{ fontSize: '0.8em', color: 'var(--muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      ({standup.region})
                    </span>
                  </span>
                  <span className="standup-date">
                    {standup.created_at ? new Date(standup.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}
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
      </div>

      <style jsx>{`
        .local-filter {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border);
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          min-width: 140px;
        }
        .local-filter:focus {
          border-color: var(--primary);
          outline: none;
        }
        .scroll-container {
          max-height: 500px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
        .team-updates-card {
          border-top: 4px solid var(--secondary);
        }
        .badge {
          display: inline-block;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
