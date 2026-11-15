const databaseErrors = {
  '23502': [400, 'Um ou mais campos obrigatórios estão ausentes.'],
  '23503': [400, 'Um dos registros relacionados não existe.'],
  '23514': [400, 'Os dados informados não atendem às regras do cadastro.'],
  '23P01': [409, 'Existe um conflito de horário ou escala.'],
  '22P02': [400, 'Um ou mais campos têm um formato inválido.'],
  '22001': [400, 'Um ou mais campos excedem o tamanho permitido.'],
  '22003': [400, 'Um ou mais valores estão fora do intervalo permitido.'],
}

const triggerMessages = new Set([
  'Não é possível emitir passagens para voos nesse status',
  'Aeronave inativa ou em manutenção',
  'Voo lotado',
  'Número de assento inválido',
])

function mapDatabaseError(error) {
  if (error.code === '23505') {
    if (error.table === 'trajeto' || error.constraint?.includes('cidade_origem'))
      return [409, 'Esse trajeto entre essas cidades já está cadastrado.']
    if (error.table === 'aeronave') return [409, 'Já existe uma aeronave com essa identificação.']
    if (error.table === 'tripulante') return [409, 'Já existe um tripulante com esse CPF.']
    if (error.table === 'usuario' || error.table === 'cliente')
      return [409, 'Já existe um usuário ou cliente com esses dados.']
    if (error.table === 'voo') return [409, 'Já existe um voo com esse número.']
    return [409, 'Já existe um registro com esses dados.']
  }
  if (error.code === 'P0001' && (
    triggerMessages.has(error.message) || error.message?.startsWith('Tripulação incompleta para programar voo ')
  )) return [400, error.message]
  return databaseErrors[error.code]
}

export default function handleError(error, request, reply) {
  const validationError = error.validation || error.statusCode === 400
  const mapped = mapDatabaseError(error)
  const [status, message] = validationError
    ? [400, 'Requisição inválida. Verifique os dados enviados.']
    : mapped || [500, 'Erro interno do servidor.']

  if (status === 500) request.log.error({ err: error }, 'Falha ao processar requisição')
  return reply.code(status).send({ erro: message })
}
