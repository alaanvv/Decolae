import db from '../db.js'

export default async (app) => {
  app.get('/', async (_request, _reply) => {
    const result = await db.query(`
      SELECT *
      FROM aeronave
    `)

    return result.rows
  })

  app.post('/', async (request, reply) => {
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

  app.put('/:identificacao', async (request, reply) => {
    const { identificacao } = request.params
    const { identificacao: novaIdentificacao = identificacao, modelo, quantidade_assentos, status } = request.body ?? {}
    if (!novaIdentificacao || !modelo || !Number.isInteger(Number(quantidade_assentos)) || Number(quantidade_assentos) < 1 || !status)
      return reply.code(400).send({ erro: 'Identificação, modelo, quantidade de assentos e status válidos são obrigatórios.' })

    try {
      const result = await db.query(
        `UPDATE aeronave
         SET identificacao = $2, modelo = $3, quantidade_assentos = $4, status = $5
         WHERE identificacao = $1
         RETURNING *`,
        [identificacao, novaIdentificacao.trim().toUpperCase(), modelo, Number(quantidade_assentos), status]
      )
      if (!result.rowCount) return reply.code(404).send({ erro: 'Aeronave não encontrada.' })
      return result.rows[0]
    } catch (error) {
      if (error.code === '22P02') return reply.code(400).send({ erro: 'Status de aeronave inválido.' })
      if (error.code === '23505') return reply.code(409).send({ erro: 'Já existe uma aeronave com essa identificação.' })
      if (error.code === '23503') return reply.code(409).send({ erro: 'A identificação não pode ser alterada enquanto a aeronave estiver associada a voos.' })
      throw error
    }
  })

  app.delete('/:identificacao', async (request, reply) => {
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
