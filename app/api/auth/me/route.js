import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth.js';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    // Don't return an error status here, return a successful response with authenticated: false
    return NextResponse.json(
      { success: false, authenticated: false, error: 'An error occurred checking authentication' },
      { status: 200 }
    );
  }
}
