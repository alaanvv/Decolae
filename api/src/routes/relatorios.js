import db from '../db.js'
import { requireRole } from '../security.js'

export default async (app) => {
  app.get('/', { preHandler: requireRole('ADMINISTRADOR', 'GERENTE') }, async (_request, reply) => {
    const [ocupacaoRes, faturamentoRes, auditoriaRes] = await Promise.all([
      db.query(`
        SELECT
          numero_voo,
          status,
          cidade_origem,
          cidade_destino,
          previsao_partida,
          aeronave_id,
          aeronave_modelo,
          capacidade_total,
          assentos_ocupados,
          assentos_disponiveis,
          taxa_ocupacao_percentual,
          receita_confirmada
        FROM vw_ocupacao_voos
        ORDER BY previsao_partida ASC
      `),
      db.query(`
        SELECT
          id_trajeto,
          cidade_origem,
          cidade_destino,
          total_voos,
          total_passagens_ativas,
          total_passagens_canceladas,
          faturamento_total
        FROM vw_faturamento_trajeto
      `),
      db.query(`
        SELECT
          id_log,
          tabela_afetada,
          operacao,
          registro_id,
          status_anterior,
          status_novo,
          detalhes,
          registrado_em
        FROM log_auditoria
        ORDER BY id_log DESC
        LIMIT 15
      `)
    ])

    return reply.send({
      ocupacao: ocupacaoRes.rows,
      faturamento: faturamentoRes.rows,
      auditoria: auditoriaRes.rows
    })
  })
}
