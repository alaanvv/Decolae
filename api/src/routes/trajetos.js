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
    } = request.body ?? {}

    if (!cidade_origem || !cidade_destino)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    const duplicate = await db.query(
      `SELECT 1
       FROM trajeto
       WHERE lower(btrim(cidade_origem)) = lower(btrim($1))
         AND lower(btrim(cidade_destino)) = lower(btrim($2))
       LIMIT 1`,
      [cidade_origem, cidade_destino]
    )
    if (duplicate.rowCount > 0)
      return reply.code(409).send({ erro: 'Esse trajeto entre essas cidades já está cadastrado.' })

    let result
    try {
      result = await db.query(
        `INSERT INTO trajeto (cidade_origem, cidade_destino)
         VALUES ($1, $2)
         RETURNING *`,
        [cidade_origem, cidade_destino]
      )
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Esse trajeto entre essas cidades já está cadastrado.' })
      throw error
    }

    return reply.code(201).send(result.rows[0])
  })

  app.put('/:id', async (request, reply) => {
    const id = Number(request.params.id)
    const { cidade_origem, cidade_destino } = request.body ?? {}
    if (!Number.isInteger(id) || id < 1)
      return reply.code(400).send({ erro: 'Identificador de trajeto inválido.' })
    if (!cidade_origem || !cidade_destino)
      return reply.code(400).send({ erro: 'Origem e destino são obrigatórios.' })

    const duplicate = await db.query(
      `SELECT 1 FROM trajeto
       WHERE id_trajeto <> $1
         AND lower(btrim(cidade_origem)) = lower(btrim($2))
         AND lower(btrim(cidade_destino)) = lower(btrim($3))
       LIMIT 1`,
      [id, cidade_origem, cidade_destino]
    )
    if (duplicate.rowCount)
      return reply.code(409).send({ erro: 'Esse trajeto entre essas cidades já está cadastrado.' })

    try {
      const result = await db.query(
        `UPDATE trajeto SET cidade_origem = $2, cidade_destino = $3
         WHERE id_trajeto = $1 RETURNING *`,
        [id, cidade_origem, cidade_destino]
      )
      if (!result.rowCount) return reply.code(404).send({ erro: 'Trajeto não encontrado.' })
      return result.rows[0]
    } catch (error) {
      if (error.code === '23514')
        return reply.code(400).send({ erro: 'Origem e destino devem ser cidades diferentes.' })
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Esse trajeto entre essas cidades já está cadastrado.' })
      throw error
    }
  })

  app.delete('/:id', async (request, reply) => {
    const id = Number(request.params.id)
    if (!Number.isInteger(id) || id < 1)
      return reply.code(400).send({ erro: 'Identificador de trajeto inválido.' })

    try {
      const result = await db.query(
        'DELETE FROM trajeto WHERE id_trajeto = $1 RETURNING id_trajeto',
        [id]
      )
      if (!result.rowCount)
        return reply.code(404).send({ erro: 'Trajeto não encontrado.' })
      return reply.code(204).send()
    } catch (error) {
      if (error.code === '23503')
        return reply.code(409).send({ erro: 'Não é possível excluir um trajeto associado a voos.' })
      throw error
    }
  })
}
