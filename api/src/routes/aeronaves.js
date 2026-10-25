const db = require('../db')

async function rotasAeronaves(app) {
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
    } = request.body

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
}

module.exports = rotasAeronaves
