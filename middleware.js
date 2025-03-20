import { NextResponse } from 'next/server';

export default function middleware(request) {
  const sessionCookie = request.cookies.get('session_id');
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  
  // Don't apply middleware to API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  
  // User is not logged in and trying to access a protected route
  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // User is logged in and trying to access login page
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Define which routes middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except next.js assets and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
