import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // If no token or secret, redirect to login
  if (!token || !SECRET) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify token
  try {
    jwt.verify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('token');
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/chat/:path*',
  ],
};

