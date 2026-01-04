export interface User {
  id: number;
  name: string;
  region: string;
  role: 'admin' | 'member';
}

export interface Standup {
  id?: number;
  user_id: number;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  created_at?: string;
  
  // Joins
  name?: string;
  region?: string;
  role?: string;
  user_name?: string;
}

export type Region = 'Dallas' | 'New York' | 'London' | 'Bengaluru';
