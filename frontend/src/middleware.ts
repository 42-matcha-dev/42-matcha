import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/search', req.url));
      } catch {
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.delete('token');
        return res
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('token');
    return res;
  }
}

export const config = {
  matcher: [
    '/',
    '/search/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/notifications/:path*',
    '/settings/:path*',
  ],
};

