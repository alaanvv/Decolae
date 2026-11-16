// Simulação das regras de negócio e de conflito exigidas pelo enunciado,
// executada direto contra o PostgreSQL (onde as regras são aplicadas).
//
// Usada por dois lugares:
//   - npm run debug:regras          → saída no terminal (api/scripts/debug-regras.js)
//   - aba "Testes de regras" no app → rota POST /api/debug/regras
//
// Todos os dados criados usam o prefixo DBG / nome "Debug" e são apagados no
// início e no fim da execução; os dados reais do banco não são tocados.
// Documentação dos cenários: docs/testes-regras.md
import pg from 'pg'

const ERROS_DE_REGRA = new Set(['23P01', '23514', '23505', 'P0001'])
// Impede duas simulações simultâneas (terminal + navegador), já que ambas
// usariam os mesmos dados DBG.
const CHAVE_LOCK = 742001

const BASE = Date.UTC(2030, 0, 1, 12)
const h = horas => new Date(BASE + horas * 3600e3).toISOString()
const espera = ms => new Promise(resolve => setTimeout(resolve, ms))

export class SimulacaoEmAndamento extends Error {}

/**
 * Executa todos os cenários e emite eventos conforme avançam:
 *   { tipo: 'secao', id, titulo, requisito }
 *   { tipo: 'verificacao', secao, ok, descricao, esperado, detalhe }
 *   { tipo: 'fim', total, passaram, duracaoMs }
 */
export async function executaSimulacao({ connectionString, onEvento = () => {} }) {
  const pool = new pg.Pool({ connectionString, options: '-c search_path=decolae', max: 20 })
  const lock = await pool.connect()
  const inicio = Date.now()
  try {
    const { rows } = await lock.query('SELECT pg_try_advisory_lock($1) AS ok', [CHAVE_LOCK])
    if (!rows[0].ok) throw new SimulacaoEmAndamento('Já existe uma simulação em andamento. Aguarde ela terminar.')

    const sim = criaSimulacao(pool, onEvento)
    await sim.limpa()
    try {
      await sim.preparaTrajeto()
      for (const cenario of CENARIOS) await cenario(sim)
    } finally {
      await sim.limpa()
    }
    const passaram = sim.resultados.filter(r => r.ok).length
    const resumo = { total: sim.resultados.length, passaram, duracaoMs: Date.now() - inicio }
    onEvento({ tipo: 'fim', ...resumo })
    return { ...resumo, resultados: sim.resultados }
  } finally {
    await lock.query('SELECT pg_advisory_unlock($1)', [CHAVE_LOCK]).catch(() => {})
    lock.release()
    await pool.end()
  }
}

function criaSimulacao(pool, onEvento) {
  const q = (sql, params) => pool.query(sql, params)
  const resultados = []
  let secaoAtual = null
  let idTrajeto
  let seqTripulante = 0
  let seqCliente = 0

  const sim = {
    resultados,
    q,
    h,

    secao(id, titulo, requisito) {
      secaoAtual = id
      onEvento({ tipo: 'secao', id, titulo, requisito })
    },

    registra(ok, descricao, esperado, detalhe) {
      const r = { secao: secaoAtual, ok, descricao, esperado, detalhe }
      resultados.push(r)
      onEvento({ tipo: 'verificacao', ...r })
    },

    async esperaAceitar(descricao, fn) {
      try {
        await fn()
        sim.registra(true, descricao, 'aceitar', 'Aceito pelo banco.')
      } catch (error) {
        sim.registra(false, descricao, 'aceitar', `Esperava sucesso, mas foi recusado: ${error.message}`)
      }
    },

    async esperaRecusar(descricao, fn) {
      try {
        await fn()
        sim.registra(false, descricao, 'recusar', 'Esperava recusa, mas a operação foi ACEITA.')
      } catch (error) {
        if (ERROS_DE_REGRA.has(error.code)) sim.registra(true, descricao, 'recusar', `Recusado: ${error.message}`)
        else sim.registra(false, descricao, 'recusar', `Erro inesperado (${error.code}): ${error.message}`)
      }
    },

    async preparaTrajeto() {
      idTrajeto = (await q(
        "INSERT INTO trajeto (cidade_origem, cidade_destino) VALUES ('Debug Origem', 'Debug Destino') RETURNING id_trajeto"
      )).rows[0].id_trajeto
    },

    async aeronave(id, assentos = 180) {
      await q('INSERT INTO aeronave (identificacao, modelo, quantidade_assentos) VALUES ($1, $2, $3)', [id, 'Debug', assentos])
    },

    async tripulante() {
      const cpf = '9' + String(++seqTripulante).padStart(10, '0')
      await q('INSERT INTO tripulante (cpf, nome) VALUES ($1, $2)', [cpf, `Debug ${seqTripulante}`])
      return cpf
    },

    async cliente() {
      const cpf = '8' + String(++seqCliente).padStart(10, '0')
      await q('INSERT INTO cliente (cpf, telefone) VALUES ($1, $2)', [cpf, 'debug'])
      return cpf
    },

    async voo(numero, idAeronave, inicio, fim, executor = pool) {
      await executor.query(
        `INSERT INTO voo (numero_voo, status, previsao_partida, previsao_chegada, id_trajeto, id_aeronave)
         VALUES ($1, 'PLANEJAMENTO', $2, $3, $4, $5)`,
        [numero, h(inicio), h(fim), idTrajeto, idAeronave]
      )
    },

    async vooComStatus(numero, status, idAeronave, inicio, fim) {
      await q(
        `INSERT INTO voo (numero_voo, status, previsao_partida, previsao_chegada, id_trajeto, id_aeronave)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [numero, status, h(inicio), h(fim), idTrajeto, idAeronave]
      )
    },

    async escala(numero, cpf, funcao, executor = pool) {
      await executor.query(
        'INSERT INTO tripulacao_voo (numero_voo, cpf_tripulante, funcao_no_voo) VALUES ($1, $2, $3)',
        [numero, cpf, funcao]
      )
    },

    async status(numero, novoStatus) {
      await q('UPDATE voo SET status = $2 WHERE numero_voo = $1', [numero, novoStatus])
    },

    async equipeCompleta(numero) {
      const equipe = {
        comandante: await sim.tripulante(),
        copiloto: await sim.tripulante(),
        comissario1: await sim.tripulante(),
        comissario2: await sim.tripulante()
      }
      await sim.escala(numero, equipe.comandante, 'COMANDANTE')
      await sim.escala(numero, equipe.copiloto, 'COPILOTO')
      await sim.escala(numero, equipe.comissario1, 'COMISSARIO')
      await sim.escala(numero, equipe.comissario2, 'COMISSARIO')
      return equipe
    },

    async vooProgramado(numero, idAeronave, inicio, fim) {
      await sim.voo(numero, idAeronave, inicio, fim)
      const equipe = await sim.equipeCompleta(numero)
      await sim.status(numero, 'PROGRAMADO')
      return equipe
    },

    async compra(cpf, numero, assento, executor = pool) {
      const r = await executor.query(
        `INSERT INTO passagem (numero_assento, data_compra, preco, status, numero_voo, cpf_cliente)
         VALUES ($1, CURRENT_DATE, 450, 'EMITIDA', $2, $3) RETURNING numero_bilhete`,
        [assento, numero, cpf]
      )
      return r.rows[0].numero_bilhete
    },

    // Abre uma conexão por operação, inicia todas as transações e só então
    // dispara as operações ao mesmo tempo, simulando requisições simultâneas.
    async corrida(operacoes) {
      const conexoes = await Promise.all(operacoes.map(() => pool.connect()))
      await Promise.all(conexoes.map(c => c.query('BEGIN')))
      const resultado = await Promise.allSettled(operacoes.map(async (operacao, i) => {
        const c = conexoes[i]
        try {
          await operacao(c)
          await c.query('COMMIT')
        } catch (error) {
          await c.query('ROLLBACK').catch(() => {})
          throw error
        }
      }))
      conexoes.forEach(c => c.release())
      const aceitas = resultado.filter(r => r.status === 'fulfilled').length
      const inesperados = resultado.filter(r => r.status === 'rejected' && !ERROS_DE_REGRA.has(r.reason.code))
      return { aceitas, recusadas: resultado.length - aceitas, inesperados }
    },

    // Intercala duas transações em ordem fixa: A executa e fica aberta,
    // B executa enquanto A ainda não confirmou, depois A confirma.
    async intercala(operacaoA, operacaoB) {
      const a = await pool.connect()
      const b = await pool.connect()
      try {
        await a.query('BEGIN')
        await operacaoA(a)
        const promessaB = operacaoB(b).then(() => ({ ok: true }), error => ({ ok: false, error }))
        await espera(500)
        await a.query('COMMIT')
        return await promessaB
      } finally {
        await a.query('ROLLBACK').catch(() => {})
        a.release()
        b.release()
      }
    },

    async limpa() {
      await q("DELETE FROM passagem WHERE numero_voo LIKE 'DBG%'")
      await q("UPDATE voo SET status = 'CANCELADO' WHERE numero_voo LIKE 'DBG%' AND status <> 'CANCELADO'")
      await q("DELETE FROM tripulacao_voo WHERE numero_voo LIKE 'DBG%'")
      await q("DELETE FROM voo WHERE numero_voo LIKE 'DBG%'")
      await q("DELETE FROM tripulante WHERE nome LIKE 'Debug %'")
      await q("DELETE FROM aeronave WHERE identificacao LIKE 'DBG%'")
      await q("DELETE FROM trajeto WHERE cidade_origem = 'Debug Origem'")
      await q("DELETE FROM cliente WHERE telefone = 'debug'")
    }
  }
  return sim
}

// ---------------------------------------------------------------------------
// Cenários (a numeração bate com docs/testes-regras.md)
// ---------------------------------------------------------------------------
const contexto = {}

async function cenarioAeronave(sim) {
  sim.secao(1, 'Aeronave não pode estar em dois voos no mesmo horário', 'RN01 — Conflito de aeronave')
  await sim.aeronave('DBG-01')
  await sim.esperaAceitar('DBG101 na aeronave DBG-01 das 0h às 2h', () => sim.voo('DBG101', 'DBG-01', 0, 2))
  await sim.esperaRecusar('DBG102 na mesma aeronave das 1h às 3h (sobrepõe)', () => sim.voo('DBG102', 'DBG-01', 1, 3))
  await sim.esperaAceitar('DBG103 na mesma aeronave das 2h às 4h (logo depois, sem sobrepor)', () => sim.voo('DBG103', 'DBG-01', 2, 4))
  await sim.esperaRecusar('Alterar o horário do DBG103 para começar às 1h (passa a sobrepor)', () =>
    sim.q('UPDATE voo SET previsao_partida = $1 WHERE numero_voo = $2', [h(1), 'DBG103']))
}

async function cenarioAeronaveConcorrente(sim) {
  sim.secao(2, 'Concorrência: dois administradores alocam a mesma aeronave ao mesmo tempo', 'RN01 + concorrência')
  await sim.aeronave('DBG-02')
  const r = await sim.corrida([
    c => sim.voo('DBG111', 'DBG-02', 0, 2, c),
    c => sim.voo('DBG112', 'DBG-02', 1, 3, c)
  ])
  sim.registra(r.aceitas === 1 && !r.inesperados.length,
    'Apenas um dos dois voos simultâneos é criado', 'concorrência',
    `${r.aceitas} aceito(s), ${r.recusadas} recusado(s).`)
}

async function cenarioTripulacaoMinima(sim) {
  sim.secao(3, 'Voo exige 1 comandante (piloto), 1 copiloto e 2 comissários', 'RN02 — Tripulação mínima')
  await sim.aeronave('DBG-03')
  await sim.voo('DBG121', 'DBG-03', 0, 2)
  const equipe = {
    comandante: await sim.tripulante(), copiloto: await sim.tripulante(),
    comissario1: await sim.tripulante(), comissario2: await sim.tripulante()
  }
  contexto.equipe = equipe
  await sim.escala('DBG121', equipe.comandante, 'COMANDANTE')
  await sim.escala('DBG121', equipe.copiloto, 'COPILOTO')
  await sim.escala('DBG121', equipe.comissario1, 'COMISSARIO')
  await sim.esperaRecusar('Programar DBG121 com só 1 comissário', () => sim.status('DBG121', 'PROGRAMADO'))
  await sim.escala('DBG121', equipe.comissario2, 'COMISSARIO')
  await sim.esperaAceitar('Programar DBG121 com a tripulação mínima completa', () => sim.status('DBG121', 'PROGRAMADO'))

  await sim.voo('DBG122', 'DBG-03', 10, 12)
  await sim.esperaRecusar('Pular de PLANEJAMENTO direto para ATRASADO sem tripulação', () => sim.status('DBG122', 'ATRASADO'))
  await sim.esperaRecusar('Pular de PLANEJAMENTO direto para EMBARQUE sem tripulação', () => sim.status('DBG122', 'EMBARQUE'))
  await sim.esperaRecusar('Criar um voo já como PROGRAMADO (sem tripulação)', () =>
    sim.vooComStatus('DBG123', 'PROGRAMADO', 'DBG-03', 20, 22))
}

async function cenarioProtegeTripulacao(sim) {
  const { equipe } = contexto
  sim.secao(4, 'Tripulação mínima de um voo programado não pode ser desfeita', 'RN02 — Tripulação mínima')
  await sim.esperaRecusar('Remover um comissário do DBG121 programado', () =>
    sim.q('DELETE FROM tripulacao_voo WHERE numero_voo = $1 AND cpf_tripulante = $2', ['DBG121', equipe.comissario2]))
  await sim.esperaRecusar('Trocar a função de um comissário do DBG121 para COMANDANTE', () =>
    sim.q(`UPDATE tripulacao_voo SET funcao_no_voo = 'COMANDANTE' WHERE numero_voo = $1 AND cpf_tripulante = $2`,
      ['DBG121', equipe.comissario1]))
  await sim.status('DBG121', 'ATRASADO')
  await sim.esperaRecusar('Remover um comissário do DBG121 depois que ele ficou ATRASADO', () =>
    sim.q('DELETE FROM tripulacao_voo WHERE numero_voo = $1 AND cpf_tripulante = $2', ['DBG121', equipe.comissario2]))
}

async function cenarioTripulanteConflito(sim) {
  const { equipe } = contexto
  sim.secao(5, 'Tripulante não pode ser escalado para voos incompatíveis', 'RN03 — Conflito de tripulante')
  await sim.aeronave('DBG-04')
  await sim.voo('DBG131', 'DBG-04', 1, 3)
  await sim.esperaRecusar('Escalar o comandante do DBG121 (0h–2h) no DBG131 (1h–3h)', () =>
    sim.escala('DBG131', equipe.comandante, 'COMANDANTE'))
  await sim.voo('DBG132', 'DBG-04', 3, 5)
  await sim.esperaAceitar('Escalar o mesmo comandante no DBG132 (3h–5h, sem sobrepor)', () =>
    sim.escala('DBG132', equipe.comandante, 'COMANDANTE'))
}

async function cenarioTripulanteConcorrente(sim) {
  sim.secao(6, 'Concorrência: o mesmo tripulante escalado em dois voos sobrepostos ao mesmo tempo', 'RN03 + concorrência')
  await sim.aeronave('DBG-07')
  await sim.aeronave('DBG-08')
  await sim.voo('DBG151', 'DBG-07', 200, 202)
  await sim.voo('DBG152', 'DBG-08', 201, 203)
  const z = await sim.tripulante()
  const r = await sim.corrida([
    c => sim.escala('DBG151', z, 'COMISSARIO', c),
    c => sim.escala('DBG152', z, 'COMISSARIO', c)
  ])
  sim.registra(r.aceitas === 1 && !r.inesperados.length,
    'Apenas uma das duas escalas simultâneas é aceita', 'concorrência',
    `${r.aceitas} aceita(s), ${r.recusadas} recusada(s).`)
}

async function cenarioDescanso(sim) {
  sim.secao(7, 'Escala: máximo de 12h de trabalho sem descanso mínimo de 36h', 'RN04 — Jornada e descanso')
  await sim.aeronave('DBG-05')
  await sim.aeronave('DBG-06')
  const y = await sim.tripulante()
  await sim.voo('DBG141', 'DBG-05', 100, 105)
  await sim.voo('DBG142', 'DBG-05', 110, 115)
  await sim.voo('DBG143', 'DBG-05', 120, 123)
  await sim.voo('DBG144', 'DBG-05', 150, 155)
  await sim.voo('DBG145', 'DBG-06', 151, 156)
  await sim.esperaAceitar('Voo de 5h (total no bloco: 5h)', () => sim.escala('DBG141', y, 'COPILOTO'))
  await sim.esperaAceitar('Outro voo de 5h após 5h de intervalo (total: 10h)', () => sim.escala('DBG142', y, 'COPILOTO'))
  await sim.esperaRecusar('Mais um voo de 3h após 5h de intervalo (total: 13h > 12h)', () => sim.escala('DBG143', y, 'COPILOTO'))
  await sim.esperaRecusar('Voo de 5h após só 35h de descanso (ainda no mesmo bloco: 15h)', () => sim.escala('DBG144', y, 'COPILOTO'))
  await sim.esperaAceitar('Voo de 5h após 36h de descanso (novo bloco de trabalho)', () => sim.escala('DBG145', y, 'COPILOTO'))
  await sim.esperaRecusar('Antecipar esse último voo para 25h depois do anterior (volta a somar 15h)', () =>
    sim.q('UPDATE voo SET previsao_partida = $1, previsao_chegada = $2 WHERE numero_voo = $3', [h(140), h(145), 'DBG145']))
}

async function cenarioCancelamento(sim) {
  sim.secao(8, 'Voo cancelado libera aeronave e tripulação; reativá-lo é verificado de novo', 'RN01 + RN03 — Cancelamento')
  await sim.aeronave('DBG-09')
  await sim.aeronave('DBG-10')
  const w = await sim.tripulante()
  await sim.voo('DBG161', 'DBG-09', 300, 302)
  await sim.escala('DBG161', w, 'COMANDANTE')
  await sim.status('DBG161', 'CANCELADO')
  await sim.voo('DBG162', 'DBG-10', 300, 302)
  await sim.esperaAceitar('Escalar no mesmo horário um tripulante que estava no voo cancelado', () => sim.escala('DBG162', w, 'COMANDANTE'))
  await sim.esperaAceitar('Usar no mesmo horário a aeronave do voo cancelado', () => sim.voo('DBG163', 'DBG-09', 300, 302))
  await sim.esperaRecusar('Reativar o voo cancelado (aeronave e tripulante agora estão ocupados)', () => sim.status('DBG161', 'PLANEJAMENTO'))
}

async function cenarioPassagens(sim) {
  sim.secao(9, 'Compra de passagens: status, assento, capacidade e horários do cliente', 'RN05 + RN06 — Passagens')
  await sim.aeronave('DBG-11', 2)
  await sim.aeronave('DBG-12')
  await sim.aeronave('DBG-13')
  const [c1, c2, c3] = [await sim.cliente(), await sim.cliente(), await sim.cliente()]
  await sim.voo('DBG171', 'DBG-11', 400, 402)
  await sim.esperaRecusar('Comprar passagem de voo ainda em PLANEJAMENTO', () => sim.compra(c1, 'DBG171', 1))
  await sim.equipeCompleta('DBG171')
  await sim.status('DBG171', 'PROGRAMADO')
  let bilheteC1
  await sim.esperaAceitar('Cliente 1 compra o assento 1 (aeronave com 2 assentos)', async () => { bilheteC1 = await sim.compra(c1, 'DBG171', 1) })
  await sim.esperaRecusar('Cliente 2 tenta o mesmo assento 1', () => sim.compra(c2, 'DBG171', 1))
  await sim.esperaRecusar('Cliente 2 tenta o assento 3, que não existe', () => sim.compra(c2, 'DBG171', 3))
  await sim.esperaAceitar('Cliente 2 compra o assento 2', () => sim.compra(c2, 'DBG171', 2))
  await sim.esperaRecusar('Cliente 3 tenta comprar com o voo lotado', () => sim.compra(c3, 'DBG171', 2))

  await sim.vooProgramado('DBG172', 'DBG-12', 401, 403)
  await sim.esperaRecusar('Cliente 1 compra outro voo com horário sobreposto ao que já tem', () => sim.compra(c1, 'DBG172', 1))
  await sim.q("UPDATE passagem SET status = 'CANCELADA' WHERE numero_bilhete = $1", [bilheteC1])
  await sim.esperaAceitar('Após cancelar a passagem, cliente 1 consegue comprar o outro voo', () => sim.compra(c1, 'DBG172', 1))
  await sim.esperaAceitar('Cliente 3 compra o assento 1 que foi liberado pelo cancelamento', () => sim.compra(c3, 'DBG171', 1))

  await sim.status('DBG171', 'CANCELADO')
  await sim.vooProgramado('DBG173', 'DBG-13', 400, 402)
  await sim.esperaAceitar('Com o voo DBG171 cancelado, cliente 3 compra um voo alternativo no mesmo horário', () => sim.compra(c3, 'DBG173', 1))
  await sim.esperaRecusar('Reativar o DBG171 cria conflito de horário para o cliente 3', () => sim.status('DBG171', 'PROGRAMADO'))
}

async function cenarioPassagensConcorrentes(sim) {
  sim.secao(10, 'Concorrência: 10 clientes compram ao mesmo tempo um voo com 2 assentos', 'RN05 + concorrência')
  await sim.aeronave('DBG-14', 2)
  await sim.vooProgramado('DBG181', 'DBG-14', 500, 502)
  const clientes = []
  for (let i = 0; i < 10; i++) clientes.push(await sim.cliente())
  const r = await sim.corrida(clientes.map((cpf, i) => c => sim.compra(cpf, 'DBG181', (i % 2) + 1, c)))
  const vendidas = (await sim.q("SELECT count(*)::int AS n FROM passagem WHERE numero_voo = 'DBG181' AND status <> 'CANCELADA'")).rows[0].n
  sim.registra(r.aceitas === 2 && vendidas === 2 && !r.inesperados.length,
    'Exatamente 2 passagens são emitidas e nenhum assento é vendido duas vezes', 'concorrência',
    `${r.aceitas} compra(s) aceita(s), ${r.recusadas} recusada(s); passagens no banco: ${vendidas}.`)
}

async function cenarioCorridaProgramacao(sim) {
  sim.secao(11, 'Concorrência: remover tripulante enquanto outro usuário programa o voo', 'RN02 + concorrência')
  await sim.aeronave('DBG-15')
  await sim.voo('DBG191', 'DBG-15', 600, 602)
  const equipe = await sim.equipeCompleta('DBG191')
  const rB = await sim.intercala(
    a => a.query('DELETE FROM tripulacao_voo WHERE numero_voo = $1 AND cpf_tripulante = $2', ['DBG191', equipe.comissario2]),
    b => b.query("UPDATE voo SET status = 'PROGRAMADO' WHERE numero_voo = 'DBG191'")
  )
  const estado = (await sim.q(`
    SELECT v.status, count(tv.*) FILTER (WHERE tv.funcao_no_voo = 'COMISSARIO')::int AS comissarios
    FROM voo v LEFT JOIN tripulacao_voo tv ON tv.numero_voo = v.numero_voo
    WHERE v.numero_voo = 'DBG191' GROUP BY v.status`)).rows[0]
  sim.registra(!(estado.status === 'PROGRAMADO' && estado.comissarios < 2),
    'O voo não termina PROGRAMADO com tripulação incompleta', 'concorrência',
    `Programação ${rB.ok ? 'aceita' : `recusada (${rB.error.message})`}; estado final: ${estado.status} com ${estado.comissarios} comissário(s).`)
}

async function cenarioCorridaHorario(sim) {
  sim.secao(12, 'Concorrência: escalar tripulante enquanto outro usuário muda o horário do voo', 'RN03 + concorrência')
  await sim.aeronave('DBG-16')
  await sim.aeronave('DBG-17')
  const t = await sim.tripulante()
  await sim.voo('DBG211', 'DBG-16', 700, 702)
  await sim.escala('DBG211', t, 'COMANDANTE')
  await sim.voo('DBG212', 'DBG-17', 710, 712)
  const rB = await sim.intercala(
    a => sim.escala('DBG212', t, 'COMANDANTE', a),
    b => b.query('UPDATE voo SET previsao_partida = $1, previsao_chegada = $2 WHERE numero_voo = $3', [h(701), h(703), 'DBG212'])
  )
  const sobreposicoes = (await sim.q(`
    SELECT count(*)::int AS n
    FROM tripulacao_voo a JOIN voo va ON va.numero_voo = a.numero_voo
    JOIN tripulacao_voo b ON b.cpf_tripulante = a.cpf_tripulante AND b.numero_voo > a.numero_voo
    JOIN voo vb ON vb.numero_voo = b.numero_voo
    WHERE a.cpf_tripulante = $1
      AND va.previsao_partida < vb.previsao_chegada AND vb.previsao_partida < va.previsao_chegada`, [t])).rows[0].n
  sim.registra(sobreposicoes === 0,
    'O tripulante não termina escalado em dois voos sobrepostos', 'concorrência',
    `Mudança de horário ${rB.ok ? 'aceita' : `recusada (${rB.error.message})`}; voos sobrepostos do tripulante: ${sobreposicoes}.`)
}

const CENARIOS = [
  cenarioAeronave,
  cenarioAeronaveConcorrente,
  cenarioTripulacaoMinima,
  cenarioProtegeTripulacao,
  cenarioTripulanteConflito,
  cenarioTripulanteConcorrente,
  cenarioDescanso,
  cenarioCancelamento,
  cenarioPassagens,
  cenarioPassagensConcorrentes,
  cenarioCorridaProgramacao,
  cenarioCorridaHorario
]
