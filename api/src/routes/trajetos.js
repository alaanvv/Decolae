import db from '../db.js'

export default async (app) => {
  app.get('/', async (_request, _reply) => {
    const result = await db.query(`
      SELECT *
      FROM trajeto
    `)

    return result.rows
  })

  app.post('/', async (request, reply) => {
    const {
      cidade_origem,
      cidade_destino
    } = request.body

    if (!cidade_origem || !cidade_destino)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    const result = await db.query(
      `INSERT INTO trajeto (
        cidade_origem,
        cidade_destino
      )
      VALUES ($1, $2)
      RETURNING *`,
      [
        cidade_origem,
        cidade_destino
      ]
    )

    return reply.code(201).send(result.rows[0])
  })
}
