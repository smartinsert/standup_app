import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { User, Region } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    let query = 'SELECT * FROM team_members ORDER BY name ASC';
    const params: string[] = [];

    if (region) {
      query = 'SELECT * FROM team_members WHERE region = ? ORDER BY name ASC';
      params.push(region);
    }

    const stmt = db.prepare(query);
    const members = stmt.all(...params) as User[];
    return NextResponse.json(members);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, region, role } = body as { name: string; region: Region; role?: string };

    if (!name || !region) {
      return NextResponse.json({ error: 'Name and Region are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO team_members (name, region, role)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(name, region, role || 'member');
    return NextResponse.json({ id: info.lastInsertRowid }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json({ error: 'Member already exists' }, { status: 409 });
    }
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
