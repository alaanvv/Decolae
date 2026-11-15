import db from '../db.js'
import { createSession, hashPassword, requireAuth, requireRole, sessionCookie, verifyPassword } from '../security.js'

export default async (app) => {
  app.post('/register', async (request, reply) => {
    const { email, nome, senha, cpf, telefone } = request.body ?? {}
    if (!email || !nome || !senha || !cpf || !telefone)
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios.' })
    if (senha.length < 8)
      return reply.code(400).send({ erro: 'A senha deve ter pelo menos 8 caracteres.' })

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
        [email, nome, hashPassword(senha), cpf, 'CLIENTE']
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

  app.post('/register-super', { preHandler: requireRole('ADMINISTRADOR') }, async (request, reply) => {
    const { email, nome, senha, tipo } = request.body ?? {}
    if (!email || !nome || !senha || !['GERENTE', 'ADMINISTRADOR'].includes(tipo))
      return reply.code(400).send({ erro: 'Todos os campos são obrigatórios.' })
    if (senha.length < 8)
      return reply.code(400).send({ erro: 'A senha deve ter pelo menos 8 caracteres.' })

    const result = await db.query(
      `INSERT INTO usuario (email, nome, senha, cpf_cliente, tipo)
       VALUES ($1, $2, $3, NULL, $4)
       RETURNING email, nome, tipo`,
      [email, nome, hashPassword(senha), tipo]
    )
    return reply.code(201).send(result.rows[0])
  })

  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body ?? {}
    if (!email || !senha)
      return reply.code(400).send({ erro: 'E-mail e senha são obrigatórios.' })

    const result = await db.query(`
      SELECT usuario.email, usuario.nome, usuario.tipo, usuario.cpf_cliente,
             usuario.senha, cliente.telefone
      FROM usuario
      LEFT JOIN cliente ON cliente.cpf = usuario.cpf_cliente
      WHERE usuario.email = $1
    `, [email])

    const user = result.rows[0]
    if (!user)
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })

    const checked = verifyPassword(senha, user.senha)
    if (!checked.valid)
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    if (checked.legacy)
      await db.query('UPDATE usuario SET senha = $2 WHERE email = $1', [email, hashPassword(senha)])

    const session = createSession(user)
    reply.header('Set-Cookie', sessionCookie(session.value, session.maxAge))
    const { senha: _password, ...publicUser } = user
    return publicUser
  })

  app.post('/logout', async (_request, reply) => {
    reply.header('Set-Cookie', sessionCookie('', 0))
    return reply.code(204).send()
  })

  app.get('/session', { preHandler: requireAuth }, async (request, reply) => {
    const result = await db.query(
      'SELECT email, nome, tipo, cpf_cliente FROM usuario WHERE email = $1',
      [request.user.email]
    )
    if (!result.rowCount) {
      reply.header('Set-Cookie', sessionCookie('', 0))
      return reply.code(401).send({ erro: 'Sessão inválida.' })
    }
    return result.rows[0]
  })
}
