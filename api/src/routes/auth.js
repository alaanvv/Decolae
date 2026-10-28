import db from '../db.js'

export default async (app) => {
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

  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body

    const result = await db.query(`
      SELECT *
      FROM usuario
      LEFT JOIN cliente
        ON cliente.cpf = usuario.cpf_cliente
      WHERE usuario.email = $1
      AND usuario.senha = $2
    `, [email, senha])

    if (result.rows.length === 0) {
      return reply.code(404).send({
        erro: 'Usuário não encontrado'
      })
    }

    return result.rows[0]
  });

}
