import { useState } from 'react';
import { debugApi } from '../../services/api';
import Badge from '../common/Badge';

// Executa a simulação das regras de negócio (POST /api/debug/regras) e mostra
// cada verificação em tempo real. Cenários documentados em docs/testes-regras.md.

const EXPECTED = {
  aceitar: { label: 'esperado: aceitar', tone: 'blue' },
  recusar: { label: 'esperado: recusar', tone: 'amber' },
  'concorrência': { label: 'concorrência', tone: 'slate' },
};

function SectionCard({ section, running, onlyFailures }) {
  const checks = onlyFailures ? section.checks.filter((c) => !c.ok) : section.checks;
  const failed = section.checks.filter((c) => !c.ok).length;
  const state = running ? 'running' : failed ? 'fail' : 'ok';
  const border = { running: 'border-decolae-500/50', fail: 'border-rose-500/40', ok: 'border-slate-700/60' }[state];

  if (onlyFailures && !checks.length) return null;
  return (
    <div className={`bg-slate-800/60 rounded-2xl border ${border} p-4 sm:p-5 space-y-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center">{section.id}</span>
          <h4 className="text-sm font-semibold text-white pt-1">{section.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="slate">{section.requirement}</Badge>
          {state === 'running' && <i className="fa-solid fa-circle-notch fa-spin text-decolae-500" />}
          {state === 'ok' && <Badge tone="green">{section.checks.length}/{section.checks.length} ok</Badge>}
          {state === 'fail' && <Badge tone="red">{failed} falha(s)</Badge>}
        </div>
      </div>
      <ul className="space-y-2">
        {checks.map((c, i) => (
          <li key={i} className="flex gap-3 rounded-xl bg-slate-900/40 px-3 py-2.5">
            <i className={`fa-solid mt-0.5 ${c.ok ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-rose-400'}`} />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-100">{c.descricao}</span>
                <Badge tone={EXPECTED[c.esperado]?.tone}>{EXPECTED[c.esperado]?.label}</Badge>
              </div>
              <p className={`text-xs break-words ${c.ok ? 'text-slate-400' : 'text-rose-300'}`}>{c.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RulesTestPanel() {
  const [sections, setSections] = useState([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [onlyFailures, setOnlyFailures] = useState(false);

  const checks = sections.flatMap((s) => s.checks);
  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.length - passed;

  const handleEvent = (evento) => {
    if (evento.tipo === 'secao') {
      setSections((prev) => [...prev, { id: evento.id, title: evento.titulo, requirement: evento.requisito, checks: [] }]);
    } else if (evento.tipo === 'verificacao') {
      setSections((prev) => prev.map((s) => (s.id === evento.secao ? { ...s, checks: [...s.checks, evento] } : s)));
    } else if (evento.tipo === 'fim') {
      setSummary(evento);
    } else if (evento.tipo === 'erro') {
      setError(evento.mensagem);
    }
  };

  const run = async () => {
    setSections([]);
    setSummary(null);
    setError('');
    setRunning(true);
    try {
      await debugApi.runRules(handleEvent);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const lastId = sections.at(-1)?.id;

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/60 p-4 sm:p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Testes de regras de negócio</h3>
            <p className="text-slate-400 text-sm mt-1">
              Simula em sequência os conflitos, regras de escala, compras e acessos simultâneos exigidos pelos requisitos.
              Os dados de teste (prefixo <code className="text-slate-300">DBG</code>) são criados e apagados automaticamente.
            </p>
          </div>
          <button type="button" onClick={run} disabled={running}
            className="shrink-0 px-4 py-2.5 bg-decolae-600 hover:bg-decolae-500 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-decolae-600/20">
            <i className={`fa-solid ${running ? 'fa-circle-notch fa-spin' : 'fa-play'}`} />
            {running ? 'Executando...' : sections.length ? 'Executar novamente' : 'Executar simulação'}
          </button>
        </div>

        {checks.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-emerald-400 font-semibold"><i className="fa-solid fa-circle-check" /> {passed} passaram</span>
                <span className={failed ? 'text-rose-400 font-semibold' : 'text-slate-500'}><i className="fa-solid fa-circle-xmark" /> {failed} falharam</span>
                {summary && <span className="text-slate-500">{(summary.duracaoMs / 1000).toFixed(1)}s</span>}
              </div>
              <label className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={onlyFailures} onChange={(e) => setOnlyFailures(e.target.checked)} className="accent-decolae-500" />
                Mostrar só falhas
              </label>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden flex">
              <div className="bg-emerald-500 transition-all" style={{ width: `${(passed / checks.length) * 100}%` }} />
              <div className="bg-rose-500 transition-all" style={{ width: `${(failed / checks.length) * 100}%` }} />
            </div>
          </div>
        )}

        {summary && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${failed ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}>
            {failed
              ? `${failed} de ${summary.total} verificações falharam. Veja os itens em vermelho abaixo.`
              : `Todas as ${summary.total} verificações passaram: as regras de negócio estão sendo respeitadas.`}
          </div>
        )}
        {error && <div className="rounded-xl px-4 py-3 text-sm bg-rose-500/10 text-rose-300 border border-rose-500/30">{error}</div>}
      </div>

      {onlyFailures && summary && !failed && <p className="text-center text-slate-500 text-sm">Nenhuma falha para mostrar.</p>}
      {sections.map((s) => (
        <SectionCard key={s.id} section={s} running={running && s.id === lastId} onlyFailures={onlyFailures} />
      ))}
    </div>
  );
}
