import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Standup } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const userId = searchParams.get('userId'); // For filtering by specific user

    let query = `
      SELECT s.*, m.name as user_name, m.region, m.role
      FROM standups s
      LEFT JOIN team_members m ON s.user_id = m.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }

    if (userId) {
      query += ' AND s.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY s.created_at DESC';

    const stmt = db.prepare(query);
    const standups = stmt.all(...params) as Standup[];
    return NextResponse.json(standups);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch standups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, yesterday, today, blockers, date } = body as { userId: number; yesterday?: string; today?: string; blockers?: string; date?: string };

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user details to cache name if needed, or just rely on ID
    const user = db.prepare('SELECT name FROM team_members WHERE id = ?').get(userId) as { name: string } | undefined;
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Default date to today if not provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if entry already exists for this user and date
    const existing = db.prepare('SELECT id FROM standups WHERE user_id = ? AND date = ?').get(userId, targetDate) as { id: number } | undefined;

    if (existing) {
      // Update existing entry
      const stmt = db.prepare(`
        UPDATE standups 
        SET yesterday = ?, today = ?, blockers = ?
        WHERE id = ?
      `);
      stmt.run(yesterday || '', today || '', blockers || '', existing.id);
      return NextResponse.json({ id: existing.id, updated: true }, { status: 200 });
    } else {
      // Create new entry
      const stmt = db.prepare(`
        INSERT INTO standups (user_id, user_name, yesterday, today, blockers, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(userId, user.name, yesterday || '', today || '', blockers || '', targetDate);
      return NextResponse.json({ id: info.lastInsertRowid, created: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create standup' }, { status: 500 });
  }
}
