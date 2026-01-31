import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const REALM = 'Elternbereich'

function parseBasicAuth(authHeader: string) {
  try {
    const [scheme, encoded] = authHeader.split(' ')
    if (!scheme || !encoded) return null
    if (scheme.toLowerCase() !== 'basic') return null

    // Edge runtime: atob is available, but can throw
    const decoded = atob(encoded)
    const idx = decoded.indexOf(':')
    if (idx < 0) return null

    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''

  const creds = parseBasicAuth(auth)
  const ok =
    creds &&
    creds.user === process.env.BASIC_AUTH_USER &&
    creds.pass === process.env.BASIC_AUTH_PASSWORD

  if (ok) return NextResponse.next()

  // Always challenge (not 403), so browsers show the login prompt
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  })
}

// Optional: protect everything except Vercel internals (safe default)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
