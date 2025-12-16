import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET: Fetch user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, email, display_name, profile_picture_url, bio, created_at
       FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Also get user's posts count
    const [postCount] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = ?',
      [rows[0].id]
    );

    const user = rows[0];
    user.posts_count = postCount[0].count;

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to fetch user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, display_name, bio, profile_picture_url } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    // Get user ID
    const [userRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRows[0].id;

    // Update profile
    await db.execute(
      'UPDATE users SET display_name = ?, bio = ?, profile_picture_url = ? WHERE id = ?',
      [display_name || null, bio || null, profile_picture_url || null, userId]
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}