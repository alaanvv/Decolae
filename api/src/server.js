import Fastify from 'fastify'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Voos from './routes/voos.js'
import Trajetos from './routes/trajetos.js'
import Aeronaves from './routes/aeronaves.js'
import Tripulantes from './routes/tripulantes.js'
import Auth from './routes/auth.js'
import handleError from './handleError.js'
import { getSessionCookie, readSession } from './security.js'

const app = Fastify({
  logger: { level: 'warn' }
})

app.setErrorHandler(handleError)
app.setNotFoundHandler((_request, reply) =>
  reply.code(404).send({ erro: 'Rota não encontrada.' })
)
app.addHook('onRequest', async (request) => {
  request.user = readSession(getSessionCookie(request))
})

app.register(Voos, { prefix: '/api/voos' })
app.register(Trajetos, { prefix: '/api/trajetos' })
app.register(Aeronaves, { prefix: '/api/aeronaves' })
app.register(Tripulantes, { prefix: '/api/tripulantes' })
app.register(Auth, { prefix: '/api/auth' })

const appDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../app/dist')
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

app.get('/api/*', async (_request, reply) => reply.code(404).send({ erro: 'Rota da API não encontrada' }))
app.get('/*', async (request, reply) => {
  const relativePath = request.params['*'] || 'index.html'
  const requestedPath = path.resolve(appDist, relativePath)
  if (!requestedPath.startsWith(`${appDist}${path.sep}`) && requestedPath !== path.join(appDist, 'index.html'))
    return reply.code(404).send()

  try {
    const filePath = (await stat(requestedPath)).isFile() ? requestedPath : path.join(appDist, 'index.html')
    const content = await readFile(filePath)
    return reply.type(contentTypes[path.extname(filePath)] || 'application/octet-stream').send(content)
  } catch {
    return reply.code(503).type('text/plain; charset=utf-8').send('Interface indisponível. Gere o build do app primeiro.')
  }
})

try {
  await app.listen({ port: Number(process.env.PORT) || 3000, host: process.env.HOST || '127.0.0.1' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
