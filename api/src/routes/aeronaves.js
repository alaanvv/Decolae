import db from '../db.js'
import { requireAuth, requireRole } from '../security.js'

export default async (app) => {
  app.get('/', { preHandler: requireAuth }, async (_request, _reply) => {
    const result = await db.query(`
      SELECT a.identificacao, a.modelo, a.quantidade_assentos,
        CASE WHEN EXISTS (
          SELECT 1 FROM voo v
          WHERE v.id_aeronave = a.identificacao
            AND v.status IN ('PROGRAMADO', 'ATRASADO', 'EMBARQUE', 'EM_ANDAMENTO')
            AND v.previsao_partida <= now()
            AND now() < v.previsao_chegada
        ) THEN 'OPERANDO' ELSE 'DISPONIVEL' END AS status
      FROM aeronave a
    `)

    return result.rows
  })

  app.post('/', { preHandler: requireRole('GERENTE') }, async (request, reply) => {
    const {
      identificacao,
      modelo,
      quantidade_assentos
    } = request.body ?? {}

    if (!identificacao || !modelo || !quantidade_assentos)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    try {
      const result = await db.query(
        `INSERT INTO aeronave (
          identificacao,
          modelo,
          quantidade_assentos
        )
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
          identificacao,
          modelo,
          quantidade_assentos
        ]
      )

      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe uma aeronave com esse número' })

      throw error
    }
  })

  app.put('/:identificacao', { preHandler: requireRole('GERENTE') }, async (request, reply) => {
    const { identificacao } = request.params
    const { identificacao: novaIdentificacao = identificacao, modelo, quantidade_assentos } = request.body ?? {}
    if (!novaIdentificacao || !modelo || !Number.isInteger(Number(quantidade_assentos)) || Number(quantidade_assentos) < 1)
      return reply.code(400).send({ erro: 'Identificação, modelo e quantidade de assentos válidos são obrigatórios.' })

    try {
      const result = await db.query(
        `UPDATE aeronave
         SET identificacao = $2, modelo = $3, quantidade_assentos = $4
         WHERE identificacao = $1
         RETURNING *`,
        [identificacao, novaIdentificacao.trim().toUpperCase(), modelo, Number(quantidade_assentos)]
      )
      if (!result.rowCount) return reply.code(404).send({ erro: 'Aeronave não encontrada.' })
      return result.rows[0]
    } catch (error) {
      if (error.code === '23505') return reply.code(409).send({ erro: 'Já existe uma aeronave com essa identificação.' })
      if (error.code === '23503') return reply.code(409).send({ erro: 'A identificação não pode ser alterada enquanto a aeronave estiver associada a voos.' })
      throw error
    }
  })

  app.delete('/:identificacao', { preHandler: requireRole('GERENTE') }, async (request, reply) => {
    const { identificacao } = request.params
    let result
    try {
      result = await db.query(
        'DELETE FROM aeronave WHERE identificacao = $1 RETURNING identificacao',
        [identificacao]
      )
    } catch (error) {
      if (error.code === '23503')
        return reply.code(409).send({ erro: 'Não é possível excluir uma aeronave associada a voos.' })
      throw error
    }
    if (!result.rowCount)
      return reply.code(404).send({ erro: 'Aeronave não encontrada.' })
    return reply.code(204).send()
  })
}
