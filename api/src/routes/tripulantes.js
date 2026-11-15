import db from '../db.js'

export default async (app) => {
  app.get('/', async (_request, _reply) => {
    const result = await db.query(`
      SELECT *
      FROM tripulante
    `)

    return result.rows
  })

  app.post('/', async (request, reply) => {
    const {
      cpf,
      nome
    } = request.body ?? {}

    if (!cpf || !nome)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    try {
      const result = await db.query(
        `INSERT INTO tripulante (
          cpf,
          nome
        )
        VALUES ($1, $2)
        RETURNING *`,
        [
          cpf,
          nome
        ]
      )

      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe um tripulante com esse CPF' })

      throw error
    }
  })

  app.delete('/:cpf', async (request, reply) => {
    const { cpf } = request.params
    let result
    try {
      result = await db.query(
        'DELETE FROM tripulante WHERE cpf = $1 RETURNING cpf',
        [cpf]
      )
    } catch (error) {
      if (error.code === '23503') {
        return reply.code(409).send({ erro: 'Não é possível excluir um tripulante associado a voos.' })
      }
      throw error
    }
    if (!result.rowCount)
      return reply.code(404).send({ erro: 'Tripulante não encontrado.' })
    return reply.code(204).send()
  })
}
