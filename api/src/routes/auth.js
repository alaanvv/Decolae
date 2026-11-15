import db from '../db.js'

export default async (app) => {
  app.post('/register', async (request, reply) => {
    const { email, nome, senha, cpf, telefone } = request.body ?? {}
    if (!email || !nome || !senha || !cpf || !telefone)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios.' })

    const client = await db.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        'INSERT INTO cliente (cpf, telefone) VALUES ($1, $2)',
        [cpf, telefone]
      )
      const result = await client.query(
        `INSERT INTO usuario (email, nome, senha, cpf_cliente, tipo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING email, nome, tipo, cpf_cliente`,
        [email, nome, senha, cpf, 'CLIENTE']
      )
      await client.query('COMMIT')
      return reply.code(201).send(result.rows[0])
    } catch (error) {
      await client.query('ROLLBACK')
      if (error.code === '23505')
        return reply.code(409).send({ erro: 'Já existe um usuário ou cliente com esses dados.' })
      throw error
    } finally {
      client.release()
    }
  })

  app.post('/register-super', async (request, reply) => {
    const { email, nome, senha, tipo } = request.body ?? {}
    if (!email || !nome || !senha || !tipo)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios.' })

    const result = await db.query(
      `INSERT INTO usuario (email, nome, senha, cpf_cliente, tipo)
       VALUES ($1, $2, $3, NULL, $4)
       RETURNING email, nome, tipo`,
      [email, nome, senha, tipo]
    )
    return reply.code(201).send(result.rows[0])
  })

  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body ?? {}
    if (!email || !senha)
      return reply.code(400).send({ erro: 'E-mail e senha são obrigatórios.' })

    const result = await db.query(`
      SELECT usuario.email, usuario.nome, usuario.tipo, usuario.cpf_cliente,
             cliente.telefone
      FROM usuario
      LEFT JOIN cliente ON cliente.cpf = usuario.cpf_cliente
      WHERE usuario.email = $1 AND usuario.senha = $2
    `, [email, senha])

    if (result.rows.length === 0)
      return reply.code(404).send({ erro: 'E-mail ou senha incorretos.' })

    return result.rows[0]
  })
}
