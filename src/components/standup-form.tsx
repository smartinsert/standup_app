'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useUser } from '@/context/user-context';
import RichTextEditor from './rich-text-editor';
import { Standup } from '@/types';

interface StandupFormProps {
  onStandupCreated?: () => void;
  selectedDate: string;
}

interface FormData {
  yesterday: string;
  today: string;
  blockers: string;
}

export default function StandupForm({ onStandupCreated, selectedDate }: StandupFormProps) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState<FormData>({
    yesterday: '',
    today: '',
    blockers: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const canSubmit = !!currentUser && isToday;

  useEffect(() => {
    const fetchExisting = async () => {
      if (!currentUser || !selectedDate) return;
      setIsLoadingData(true);
      try {
        const res = await fetch(`/api/standups?userId=${currentUser.id}&date=${selectedDate}`);
        if (res.ok) {
          const data: Standup[] = await res.json();
          if (data.length > 0) {
             // Use the FIRST matching entry (since we are moving to 1 entry per user/day)
            const entry = data[0];
            setFormData({
              yesterday: entry.yesterday || '',
              today: entry.today || '',
              blockers: entry.blockers || ''
            });
          } else {
            setFormData({ yesterday: '', today: '', blockers: '' });
          }
        }
      } catch (e) {
        console.error("Failed to load existing standup", e);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExisting();
  }, [currentUser, selectedDate]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !currentUser) return;
    
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/standups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: currentUser.id,
          date: selectedDate
        })
      });

      if (res.ok) {
        setFormData({ yesterday: '', today: '', blockers: '' });
        
        if (onStandupCreated) onStandupCreated();
      } else {
        alert('Failed to submit standup');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting standup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (name: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
  };

  if (!currentUser) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <p>Please select your name in the filter bar to post a standup.</p>
      </div>
    );
  }

  if (!isToday) {
    return null;
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Post Update</h2>
        <span style={{ color: 'var(--accent)' }}>Posting as: {currentUser.name}</span>
      </div>
      
      {isLoadingData ? (
        <div className="loading-spinner"></div>
      ) : (
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="yesterday">What did you do yesterday?</label>
            <RichTextEditor 
              value={formData.yesterday} 
              onChange={(val) => handleEditorChange('yesterday', val)}
              placeholder="Completed API integration..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="today">What will you do today?</label>
             <RichTextEditor 
              value={formData.today} 
              onChange={(val) => handleEditorChange('today', val)}
              placeholder="Start working on frontend components..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="blockers">Any blockers?</label>
             <RichTextEditor 
              value={formData.blockers} 
              onChange={(val) => handleEditorChange('blockers', val)}
              placeholder="Waiting for design assets..."
            />
          </div>

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Post Standup'}
          </button>
        </form>
      )}
    </div>
  );
}
