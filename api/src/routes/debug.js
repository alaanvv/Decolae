import { requireRole } from '../security.js'
import { executaSimulacao, SimulacaoEmAndamento } from '../debug/simulacaoRegras.js'

// Executa a simulação de regras de negócio e envia cada evento assim que ele
// acontece, uma linha JSON por evento (NDJSON), para a aba "Testes de regras".
// Desabilitada com NODE_ENV=production, pois cria e apaga dados de teste.
export default async (app) => {
  app.post('/regras', { preHandler: requireRole('GERENTE', 'ADMINISTRADOR') }, async (request, reply) => {
    if (process.env.NODE_ENV === 'production')
      return reply.code(404).send({ erro: 'Simulação desabilitada em produção.' })

    reply.hijack()
    reply.raw.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no'
    })
    const envia = evento => reply.raw.write(`${JSON.stringify(evento)}\n`)

    try {
      await executaSimulacao({ connectionString: process.env.DATABASE_URL, onEvento: envia })
    } catch (error) {
      if (!(error instanceof SimulacaoEmAndamento)) request.log.error({ err: error }, 'Falha na simulação de regras')
      envia({ tipo: 'erro', mensagem: error instanceof SimulacaoEmAndamento ? error.message : `Falha na simulação: ${error.message}` })
    } finally {
      reply.raw.end()
    }
  })
}
