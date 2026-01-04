'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StandupForm from '@/components/standup-form';
import StandupList from '@/components/standup-list';
import CalendarFilter from '@/components/calendar-filter';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize from URL or defaults
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.get('date') || today;
  const selectedRegion = searchParams.get('region') || '';

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (date) params.set('date', date);
    else params.delete('date');
    router.push(`/standups?${params.toString()}`);
  };

  const handleRegionChange = (region: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (region) params.set('region', region);
    else params.delete('region');
    router.push(`/standups?${params.toString()}`);
  };

  const handleStandupCreated = () => {
    setRefreshKey((prev: number) => prev + 1);
  };

  return (
    <div>
       <h1 className="title-gradient" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#paint0_linear)" strokeWidth="2"/>
          <path d="M9 3V21" stroke="url(#paint1_linear)" strokeWidth="2"/>
          <defs>
            <linearGradient id="paint0_linear" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6"/>
              <stop offset="1" stopColor="#38bdf8"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="9" y1="3" x2="9" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6"/>
              <stop offset="1" stopColor="#38bdf8"/>
            </linearGradient>
          </defs>
        </svg>
        Team Standup
      </h1>
      
      <CalendarFilter 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
      />

      <StandupForm 
        onStandupCreated={handleStandupCreated} 
        selectedDate={selectedDate}
      />

      <StandupList 
        refreshTrigger={refreshKey} 
        selectedDate={selectedDate}
        selectedRegion={selectedRegion}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loading-spinner"></div>}>
      <HomeContent />
    </Suspense>
  );
}
