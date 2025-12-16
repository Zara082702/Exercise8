import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET: Fetch all posts with user information
export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT p.*, u.email, u.display_name, u.profile_picture_url
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to fetch posts. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, location, author_email, image_url } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json({
        error: 'Title and content are required'
      }, { status: 400 });
    }

    if (!author_email) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get or create user
    let [userRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [author_email]
    );

    let userId;
    if (userRows.length === 0) {
      const [userResult] = await db.execute<ResultSetHeader>(
        'INSERT INTO users (email, display_name) VALUES (?, ?)',
        [author_email, author_email.split('@')[0]]
      );
      userId = userResult.insertId;
    } else {
      userId = userRows[0].id;
    }

    // Insert the post
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO posts (title, content, category, location, author_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, category || 'General', location || '', userId, image_url || null]
    );

    return NextResponse.json({
      id: result.insertId,
      message: 'Post created successfully'
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to create post. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}