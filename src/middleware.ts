import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger solo las rutas que comiencen con "/admin-panel"
  if (!pathname.startsWith('/admin-panel')) {
    return NextResponse.next();
  }

  // Leer el token desde la cookie "token"
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Decodificar el token usando Buffer (en Node.js)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload);

    // Verificar que el rol sea "Admin" o "Superadmin"
    if (payload.role !== 'Admin' && payload.role !== 'Superadmin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-panel/:path*'],
};
