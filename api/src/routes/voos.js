const db = require('../db')

async function rotasVoos(app) {
  app.get('/', async (_request, _reply) => {
    const result = await db.query(`
      SELECT
        v.numero_voo,
        v.status,
        t.cidade_origem,
        t.cidade_destino,
        v.previsao_partida,
        v.previsao_chegada
      FROM decolae.voo v
      JOIN decolae.trajeto t
        ON t.id_trajeto = v.id_trajeto
      ORDER BY v.previsao_partida
    `)

    return result.rows
  })

  app.get('/:numero_voo', async (request, reply) => {
    const { numero_voo } = request.params

    const result = await db.query(
      `SELECT *
       FROM decolae.voo
       WHERE numero_voo = $1`,
      [numero_voo]
    )

    if (result.rows.length === 0) {
      return reply.code(404).send({
        erro: 'Voo não encontrado'
      })
    }

    return result.rows[0]
  });
}

module.exports = rotasVoos
