const Fastify = require('fastify')

const app = Fastify({ logger: { level: 'warn'} })

app.register(require('./routes/voos'), {
  prefix: '/voos'
})

async function main() {
  await app.listen({
    port: 3000,
    host: '127.0.0.1'
  })
}

main().catch((error) => {
  app.log.error(error)
  process.exit(1)
})
