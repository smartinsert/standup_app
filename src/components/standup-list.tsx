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
    if (selectedRegion) {
        if (standup.region !== selectedRegion) return false;
    }

    if (isToday && !isAdmin) {
        if (!currentUser || standup.user_id !== currentUser.id) {
            return false;
        }
    }

    return true;
  });

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
      <div className="glass-card">
        <h2 style={{ marginBottom: '1.5rem' }}>
          Team Updates for {new Date(selectedDate).toLocaleDateString()}
          {selectedRegion && <span style={{ fontSize: '0.8em', color: 'var(--muted)', marginLeft: '10px' }}>({selectedRegion})</span>}
        </h2>

        {otherStandups.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
            {isToday && !currentUser
              ? "Please select a user to see/post updates."
              : isToday && !isAdmin
                ? "You can only see your own updates for today."
                : "No other team updates found."}
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
  );
}
