import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET: Fetch comments for a specific post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT c.*, u.email, u.display_name, u.profile_picture_url
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to fetch comments',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST: Create a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, content, author_email } = body;

    if (!post_id || !content || !author_email) {
      return NextResponse.json({
        error: 'Post ID, content, and author email are required'
      }, { status: 400 });
    }

    // Get user ID
    const [userRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [author_email]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRows[0].id;

    // Insert comment
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
      [post_id, userId, content]
    );

    return NextResponse.json({
      id: result.insertId,
      message: 'Comment added successfully'
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({
      error: 'Failed to add comment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}