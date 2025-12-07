import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 1. GET: Fetch all notes from the database
export async function GET() {
  try {
    // Execute SQL query to select all notes, ordered by newest first
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM notes ORDER BY created_at DESC');
    
    // Return the data as JSON to the frontend
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Add a new note to the database
export async function POST(request: Request) {
  try {
    // Read the data sent from the frontend
    const body = await request.json();
    const { title, content, category, location, author_name } = body;

    // Basic validation
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 });
    }

    // Insert the data into MySQL
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO notes (title, content, category, location, author_name) VALUES (?, ?, ?, ?, ?)',
      [
        title, 
        content, 
        category || 'General', 
        location || '', 
        author_name || 'Neighbor'
      ]
    );

    // Return success message
    return NextResponse.json({ 
      id: result.insertId, 
      message: 'Note created successfully' 
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}