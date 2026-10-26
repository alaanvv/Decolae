const db = require('../db')

async function rotasAuth(app) {
  app.post('/register', async (request, reply) => {
    const {
      email,
      nome,
      senha,
      cpf,
      telefone
    } = request.body

    if (!email || !nome || !senha || !cpf || !telefone)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    try {
      const result = await db.query(
        `INSERT INTO cliente (
          cpf,
          telefone
        )
        VALUES ($4, $5)

        INSERT INTO usuarios (
          email,
          nome,
          senha,
          cpf,
          tipo
        )
        VALUES ($1, $2, $3, $4, $6)
        RETURNING *`,
        [
          email,
          nome,
          senha,
          cpf,
          telefone,
          'CLIENTE'
        ]
      )

      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe um usuário com esse CPF' })

      throw error
    }
  })

  app.post('/register-super', async (request, reply) => {
    const {
      email,
      nome,
      senha,
      cpf,
      tipo
    } = request.body

    if (!email || !nome || !senha || !cpf || !tipo)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios' })

    try {
      const result = await db.query(
        `INSERT INTO usuarios (
          email,
          nome,
          senha,
          cpf,
          tipo
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          email,
          nome,
          senha,
          cpf,
          tipo
        ]
      )

      return reply.code(201).send(result.rows[0])
    } catch (error) {
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe um usuário com esse CPF' })

      throw error
    }
  })

}

module.exports = rotasAuth
