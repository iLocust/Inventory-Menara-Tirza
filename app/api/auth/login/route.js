import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateUser, createSession } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    
    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone number and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const authResult = await authenticateUser(phone, password);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }
    
    try {
      // Create session
      const sessionId = await createSession(authResult.user);
      
      // Set session cookie
      cookies().set({
        name: 'session_id',
        value: sessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: authResult.user.id,
          name: authResult.user.name,
          email: authResult.user.email,
          role: authResult.user.role
        }
      });
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Error creating session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
