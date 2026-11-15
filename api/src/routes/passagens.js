import db from '../db.js'
import { requireRole } from '../security.js'

const TICKET_PRICE = Number(process.env.TICKET_PRICE) > 0 ? Number(process.env.TICKET_PRICE) : 450
const CLIENT = { preHandler: requireRole('CLIENTE') }

export default async (app) => {
  app.get('/', { preHandler: requireRole('CLIENTE', 'ADMINISTRADOR') }, async (request) => {
    const isAdmin = request.user.type === 'ADMINISTRADOR'
    const result = await db.query(`
      SELECT p.numero_bilhete, p.numero_assento, p.data_compra, p.preco, p.status,
             p.numero_voo, p.cpf_cliente, v.previsao_partida,
             t.cidade_origem, t.cidade_destino
      FROM passagem p
      JOIN voo v ON v.numero_voo = p.numero_voo
      JOIN trajeto t ON t.id_trajeto = v.id_trajeto
      WHERE ($1::boolean OR p.cpf_cliente = $2)
      ORDER BY p.data_compra DESC, p.numero_bilhete
    `, [isAdmin, request.user.cpf])
    return result.rows
  })

  app.post('/', CLIENT, async (request, reply) => {
    const { numero_voo, numero_assento } = request.body ?? {}
    const seat = Number(numero_assento)
    if (!numero_voo || !Number.isInteger(seat) || seat < 1)
      return reply.code(400).send({ erro: 'Voo e número de assento válido são obrigatórios.' })

    const client = await db.connect()
    let transaction = false
    try {
      await client.query('BEGIN')
      transaction = true

      const flightResult = await client.query(
        `SELECT v.numero_voo, v.status, v.previsao_partida, v.previsao_chegada,
                a.quantidade_assentos
         FROM voo v JOIN aeronave a ON a.identificacao = v.id_aeronave
         WHERE v.numero_voo = $1
         FOR UPDATE OF v`,
        [numero_voo]
      )
      const flight = flightResult.rows[0]
      if (!flight) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(404).send({ erro: 'Voo não encontrado.' })
      }
      if (!['PROGRAMADO', 'ATRASADO'].includes(flight.status)) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(409).send({ erro: 'Este voo não está aceitando compras.' })
      }
      if (seat > flight.quantidade_assentos) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(400).send({ erro: 'O assento informado não existe nesta aeronave.' })
      }

      const customerResult = await client.query(
        'SELECT cpf FROM cliente WHERE cpf = $1 FOR UPDATE',
        [request.user.cpf]
      )
      if (!customerResult.rowCount) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(409).send({ erro: 'A conta não está associada a um cadastro de cliente.' })
      }

      const overlap = await client.query(`
        SELECT 1
        FROM passagem p JOIN voo other ON other.numero_voo = p.numero_voo
        WHERE p.cpf_cliente = $1 AND p.status = 'EMITIDA'
          AND other.numero_voo <> $2
          AND other.previsao_partida < $4
          AND $3 < other.previsao_chegada
        LIMIT 1
      `, [request.user.cpf, numero_voo, flight.previsao_partida, flight.previsao_chegada])
      if (overlap.rowCount) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(409).send({ erro: 'Você já tem uma passagem para um voo com horário sobreposto.' })
      }

      const count = await client.query(
        "SELECT count(*)::int AS total FROM passagem WHERE numero_voo = $1 AND status <> 'CANCELADA'",
        [numero_voo]
      )
      if (count.rows[0].total >= flight.quantidade_assentos) {
        await client.query('ROLLBACK')
        transaction = false
        return reply.code(409).send({ erro: 'Este voo não possui mais assentos disponíveis.' })
      }

      const result = await client.query(
        `INSERT INTO passagem (numero_assento, data_compra, preco, status, numero_voo, cpf_cliente)
         VALUES ($1, CURRENT_DATE, $2, 'EMITIDA', $3, $4)
         RETURNING numero_bilhete, numero_assento, data_compra, preco, status, numero_voo, cpf_cliente`,
        [seat, TICKET_PRICE, numero_voo, request.user.cpf]
      )
      await client.query('COMMIT')
      transaction = false
      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (transaction) await client.query('ROLLBACK')
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Este assento acabou de ser reservado por outra pessoa.' })
      if (error.code === 'P0001')
        return reply.code(409).send({ erro: error.message })
      throw error
    } finally {
      client.release()
    }
  })

  app.patch('/:numero_bilhete/cancelar', CLIENT, async (request, reply) => {
    const result = await db.query(
      `UPDATE passagem SET status = 'CANCELADA'
       WHERE numero_bilhete = $1 AND cpf_cliente = $2 AND status = 'EMITIDA'
       RETURNING numero_bilhete`,
      [request.params.numero_bilhete, request.user.cpf]
    )
    if (!result.rowCount)
      return reply.code(404).send({ erro: 'Passagem ativa não encontrada para esta conta.' })
    return reply.code(204).send()
  })
}
