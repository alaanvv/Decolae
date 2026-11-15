import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex')
const SESSION_MAX_AGE = 60 * 60 * 8

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 64).toString('base64url')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored?.startsWith('scrypt$')) return { valid: safeEqual(password, stored ?? ''), legacy: true }
  const [, salt, expected] = stored.split('$')
  if (!salt || !expected) return { valid: false, legacy: false }
  const actual = scryptSync(password, salt, 64).toString('base64url')
  return { valid: safeEqual(actual, expected), legacy: false }
}

export function createSession(user) {
  const payload = Buffer.from(JSON.stringify({
    email: user.email,
    type: user.tipo,
    cpf: user.cpf_cliente ?? null,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  })).toString('base64url')
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return { value: `${payload}.${signature}`, maxAge: SESSION_MAX_AGE }
}

export function readSession(value) {
  if (!value) return null
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  if (!safeEqual(signature, expected)) return null
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!user.email || !user.type || user.exp <= Math.floor(Date.now() / 1000)) return null
    return user
  } catch {
    return null
  }
}

export function sessionCookie(value, maxAge = SESSION_MAX_AGE) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `decolae_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`
}

export function requireAuth(request, reply, done) {
  if (!request.user) return reply.code(401).send({ erro: 'Autenticação necessária.' })
  done()
}

export function requireRole(...roles) {
  return (request, reply, done) => {
    if (!request.user) return reply.code(401).send({ erro: 'Autenticação necessária.' })
    if (!roles.includes(request.user.type)) return reply.code(403).send({ erro: 'Você não tem permissão para esta operação.' })
    done()
  }
}

export function getSessionCookie(request) {
  const cookieHeader = request.headers.cookie ?? ''
  const pair = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('decolae_session='))
  if (!pair) return null
  try {
    return decodeURIComponent(pair.slice('decolae_session='.length))
  } catch {
    return null
  }
}
