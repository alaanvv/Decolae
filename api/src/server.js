import Fastify from 'fastify'
import cors from '@fastify/cors'

import Voos from './routes/voos.js'
import Trajetos from './routes/trajetos.js'
import Aeronaves from './routes/aeronaves.js'
import Tripulantes from './routes/tripulantes.js'
import Auth from './routes/auth.js'

const app = Fastify({
  logger: { level: 'warn' }
})

await app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.register(Voos, { prefix: '/voos' })
app.register(Trajetos, { prefix: '/trajetos' })
app.register(Aeronaves, { prefix: '/aeronaves' })
app.register(Tripulantes, { prefix: '/tripulantes' })
app.register(Auth, { prefix: '/auth' })

try {
  await app.listen({ port: 3000, host: '127.0.0.1' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
