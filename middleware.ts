import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization')

  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Elternbereich"',
      },
    })
  }

  const [, encoded] = auth.split(' ')
  const decoded = Buffer.from(encoded, 'base64').toString()
  const [user, pass] = decoded.split(':')

  if (user === 'eltern' && pass === 'Bauepoche2026') {
    return NextResponse.next()
  }

  return new NextResponse('Forbidden', { status: 403 })
}