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
        v.previsao_chegada,
        v.id_aeronave,
        a.modelo AS modelo_aeronave,
        a.quantidade_assentos
      FROM voo v
      JOIN trajeto t
        ON t.id_trajeto = v.id_trajeto
      JOIN aeronave a
        ON a.identificacao = v.id_aeronave
      ORDER BY v.previsao_partida
    `)

    return result.rows
  })

  app.post('/', async (request, reply) => {
    const {
      numero_voo,
      previsao_partida,
      previsao_chegada,
      id_trajeto,
      id_aeronave
    } = request.body ?? {}

    if (!numero_voo || !previsao_partida || !previsao_chegada || id_trajeto == null || !id_aeronave)
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
        VALUES ($1, 'PLANEJAMENTO', $2, $3, $4, $5)
        RETURNING *`,
        [
          numero_voo,
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

  app.get('/:numero_voo/tripulantes', async (request) => {
    const { numero_voo } = request.params
    const result = await db.query(
      `SELECT tr.cpf, tr.nome, tv.funcao_no_voo
       FROM tripulacao_voo tv
       JOIN tripulante tr ON tr.cpf = tv.cpf_tripulante
       WHERE tv.numero_voo = $1
       ORDER BY tv.funcao_no_voo, tr.nome`,
      [numero_voo]
    )
    return result.rows
  })

  app.post('/:numero_voo/tripulantes', async (request, reply) => {
    const { numero_voo } = request.params
    const { cpf_tripulante, funcao_no_voo } = request.body ?? {}
    if (!cpf_tripulante || !funcao_no_voo)
      return reply.code(400).send({ erro: 'Tripulante e função são obrigatórios.' })
    try {
      const result = await db.query(
        `INSERT INTO tripulacao_voo (numero_voo, cpf_tripulante, funcao_no_voo)
         VALUES ($1, $2, $3) RETURNING *`,
        [numero_voo, cpf_tripulante.replace(/\D/g, ''), funcao_no_voo]
      )
      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505') return reply.code(409).send({ erro: 'Esse tripulante já está na escala deste voo.' })
      if (error.code === '23503') return reply.code(404).send({ erro: 'Voo ou tripulante não encontrado.' })
      if (error.code === '22P02') return reply.code(400).send({ erro: 'Função de tripulante inválida.' })
      throw error
    }
  })

  app.delete('/:numero_voo/tripulantes/:cpf', async (request, reply) => {
    const { numero_voo, cpf } = request.params
    const result = await db.query(
      'DELETE FROM tripulacao_voo WHERE numero_voo = $1 AND cpf_tripulante = $2 RETURNING cpf_tripulante',
      [numero_voo, cpf]
    )
    if (!result.rowCount) return reply.code(404).send({ erro: 'Tripulante não encontrado na escala deste voo.' })
    return reply.code(204).send()
  })

  app.patch('/:numero_voo/status', async (request, reply) => {
    const { numero_voo } = request.params
    const { status } = request.body ?? {}
    if (!status) return reply.code(400).send({ erro: 'Status é obrigatório.' })
    try {
      const result = await db.query(
        'UPDATE voo SET status = $2 WHERE numero_voo = $1 RETURNING numero_voo, status',
        [numero_voo, status]
      )
      if (!result.rowCount) return reply.code(404).send({ erro: 'Voo não encontrado.' })
      return result.rows[0]
    } catch (error) {
      if (error.code === '22P02') return reply.code(400).send({ erro: 'Status de voo inválido.' })
      if (error.code === 'P0001') return reply.code(400).send({ erro: error.message })
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
