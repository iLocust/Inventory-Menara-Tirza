import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { endSession } from '../../../../lib/auth.js';

export async function POST() {
  try {
    // End the session in database
    await endSession();
    
    // Clear the cookie
    cookies().set({
      name: 'session_id',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire immediately
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
