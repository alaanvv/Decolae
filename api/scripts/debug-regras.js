// Executa a simulação das regras de negócio no terminal.
// Uso: npm run debug:regras   (documentação: docs/testes-regras.md)
import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { executaSimulacao, SimulacaoEmAndamento } from '../src/debug/simulacaoRegras.js'

const here = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(here, '../.env'), quiet: true })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida em api/.env')
  process.exit(1)
}

const cor = { verde: '\x1b[32m', vermelho: '\x1b[31m', cinza: '\x1b[90m', negrito: '\x1b[1m', fim: '\x1b[0m' }

function imprime(evento) {
  if (evento.tipo === 'secao') {
    console.log(`\n${cor.negrito}${evento.id}. ${evento.titulo}${cor.fim} ${cor.cinza}[${evento.requisito}]${cor.fim}`)
  } else if (evento.tipo === 'verificacao') {
    const marca = evento.ok ? `${cor.verde}✔` : `${cor.vermelho}✘`
    console.log(`  ${marca} ${evento.descricao}${cor.fim}`)
    console.log(`      ${cor.cinza}${evento.detalhe}${cor.fim}`)
  }
}

console.log(`${cor.negrito}Decolaê — simulação das regras de negócio${cor.fim}`)
try {
  const { total, passaram, resultados } = await executaSimulacao({
    connectionString: process.env.DATABASE_URL,
    onEvento: imprime
  })
  console.log(`\n${cor.negrito}Resultado: ${passaram}/${total} verificações passaram${cor.fim}`)
  for (const f of resultados.filter(r => !r.ok)) console.log(`  ${cor.vermelho}✘ [${f.secao}] ${f.descricao}${cor.fim}`)
  process.exit(passaram === total ? 0 : 1)
} catch (error) {
  console.error(error instanceof SimulacaoEmAndamento ? error.message : error)
  process.exit(2)
}
