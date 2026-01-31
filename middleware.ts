import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function decodeBasicAuth(authHeader: string) {
  const parts = authHeader.split(' ')
  if (parts.length !== 2) return null
  const scheme = parts[0]
  const encoded = parts[1]
  if (scheme.toLowerCase() !== 'basic') return null

  // Edge runtime: atob is available
  const decoded = atob(encoded)
  const idx = decoded.indexOf(':')
  if (idx === -1) return null
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
}

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization')

  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Elternbereich"' },
    })
  }

  const creds = decodeBasicAuth(auth)
  if (!creds) return new NextResponse('Forbidden', { status: 403 })

  const ok =
    creds.user === process.env.BASIC_AUTH_USER &&
    creds.pass === process.env.BASIC_AUTH_PASSWORD

  if (ok) return NextResponse.next()
  return new NextResponse('Forbidden', { status: 403 })
}
