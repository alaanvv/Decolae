const Fastify = require('fastify')

const app = Fastify({ logger: { level: 'warn'} })

app.register(require('./routes/voos'), {
  prefix: '/voos'
})

app.register(require('./routes/trajetos'), {
  prefix: '/trajetos'
})

app.register(require('./routes/aeronaves'), {
  prefix: '/aeronaves'
})

app.register(require('./routes/tripulantes'), {
  prefix: '/tripulantes'
})

app.listen({
  port: 3000,
  host: '127.0.0.1'
})
