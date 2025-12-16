import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// POST: Upload file to local storage (temporary solution)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userEmail = formData.get('userEmail') as string;

    if (!file || !userEmail) {
      return NextResponse.json({
        error: 'File and user email are required'
      }, { status: 400 });
    }

    // Validate file size (max 5MB for local storage)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'File type not allowed. Only JPEG, PNG, GIF, and WebP images are supported.'
      }, { status: 400 });
    }

    // Get user ID
    const [userRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRows[0].id;

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Create public URL
    const downloadURL = `/uploads/${fileName}`;

    // Save to database
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO media_uploads (user_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
      [userId, file.name, downloadURL, file.type, file.size]
    );

    return NextResponse.json({
      id: result.insertId,
      url: downloadURL,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({
      error: 'Failed to upload file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}