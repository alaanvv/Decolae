import db from '../db.js'

export default async (app) => {
  app.get('/', async (_request, _reply) => {
    const result = await db.query(`
      SELECT
        v.numero_voo,
        v.status,
        t.cidade_origem,
        t.cidade_destino,
        v.previsao_partida,
        v.previsao_chegada
      FROM voo v
      JOIN trajeto t
        ON t.id_trajeto = v.id_trajeto
      ORDER BY v.previsao_partida
    `)

    return result.rows
  })

  app.post('/', async (request, reply) => {
    const {
      numero_voo,
      status,
      previsao_partida,
      previsao_chegada,
      id_trajeto,
      id_aeronave
    } = request.body

    if (!numero_voo || !status || !previsao_partida || !previsao_chegada || !id_trajeto || !id_aeronave)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    try {
      const result = await db.query(
        `INSERT INTO voo (
          numero_voo,
          status,
          previsao_partida,
          previsao_chegada,
          id_trajeto,
          id_aeronave
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          numero_voo,
          status,
          previsao_partida,
          previsao_chegada,
          id_trajeto,
          id_aeronave
        ]
      )

      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe um voo com esse número' })

      if (error.code === '23503')
        return reply.code(400).send({ erro: 'Trajeto ou aeronave inexistente' })

      if (error.code === '22P02')
        return reply.code(400).send({ erro: 'Valor inválido para um dos campos' })

      throw error
    }
  })

  app.get('/:numero_voo', async (request, reply) => {
    const { numero_voo } = request.params

    const result = await db.query(`
      SELECT *
      FROM voo v
      JOIN aeronave a
        ON a.identificacao = v.id_aeronave
      JOIN trajeto t
        ON t.id_trajeto = v.id_trajeto
      JOIN tripulacao_voo tv
        ON tv.numero_voo = v.numero_voo
      JOIN tripulante tr
        ON tr.cpf = tv.cpf_tripulante
      WHERE v.numero_voo = $1
    `, [numero_voo])

    if (result.rows.length === 0) {
      return reply.code(404).send({
        erro: 'Voo não encontrado'
      })
    }

    return result.rows[0]
  });
}
