const db = require('../db')

async function rotasTripulantes(app) {
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
    } = request.body

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
}

module.exports = rotasTripulantes
