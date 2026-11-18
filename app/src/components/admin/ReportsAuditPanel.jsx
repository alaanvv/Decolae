import { useEffect, useState } from 'react';

const money = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ReportsAuditPanel() {
  const [data, setData] = useState({ ocupacao: [], faturamento: [], auditoria: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/relatorios', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || 'Erro ao carregar relatórios SQL.');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <i className="fa-solid fa-database text-decolae-400" />
            Relatórios Analíticos (SQL Views) & Auditoria (Trigger)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dados agregados diretamente via <code className="text-decolae-300">vw_ocupacao_voos</code>,{' '}
            <code className="text-decolae-300">vw_faturamento_trajeto</code> e <code className="text-decolae-300">log_auditoria</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 self-start transition"
        >
          <i className={`fa-solid fa-rotate ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Grid das duas Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View 1: Ocupação por Voo */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-700/60 p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-chair text-decolae-400" />
            Ocupação por Voo (<span className="font-mono text-xs text-slate-400">vw_ocupacao_voos</span>)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-2">Voo / Rota</th>
                  <th className="py-2 px-2">Assentos</th>
                  <th className="py-2 px-2">Ocupação</th>
                  <th className="py-2 pl-2 text-right">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.ocupacao.map((v) => (
                  <tr key={v.numero_voo}>
                    <td className="py-2 pr-2">
                      <div className="font-semibold text-white">{v.numero_voo}</div>
                      <div className="text-[11px] text-slate-400">
                        {v.cidade_origem} → {v.cidade_destino}
                      </div>
                    </td>
                    <td className="py-2 px-2 font-mono">
                      {v.assentos_ocupados}/{v.capacidade_total}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-decolae-500"
                            style={{ width: `${Math.min(Number(v.taxa_ocupacao_percentual), 100)}%` }}
                          />
                        </div>
                        <span>{v.taxa_ocupacao_percentual}%</span>
                      </div>
                    </td>
                    <td className="py-2 pl-2 text-right font-medium text-emerald-400">
                      {money(v.receita_confirmada)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View 2: Faturamento por Trajeto */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-700/60 p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-route text-decolae-400" />
            Faturamento por Trajeto (<span className="font-mono text-xs text-slate-400">vw_faturamento_trajeto</span>)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-2">Trajeto</th>
                  <th className="py-2 px-2 text-center">Voos</th>
                  <th className="py-2 px-2 text-center">Bilhetes Ativos</th>
                  <th className="py-2 pl-2 text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.faturamento.map((t) => (
                  <tr key={t.id_trajeto}>
                    <td className="py-2 pr-2 font-medium text-white">
                      {t.cidade_origem} → {t.cidade_destino}
                    </td>
                    <td className="py-2 px-2 text-center">{t.total_voos}</td>
                    <td className="py-2 px-2 text-center">{t.total_passagens_ativas}</td>
                    <td className="py-2 pl-2 text-right font-medium text-emerald-400">
                      {money(t.faturamento_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log da Trigger de Auditoria */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700/60 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-amber-400" />
          Log Automático de Auditoria (<span className="font-mono text-xs text-slate-400">trigger_auditoria_voo</span>)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 pr-2">#</th>
                <th className="py-2 px-2">Operação</th>
                <th className="py-2 px-2">Voo</th>
                <th className="py-2 px-2">Transição de Status</th>
                <th className="py-2 pl-2">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {data.auditoria.map((log) => (
                <tr key={log.id_log}>
                  <td className="py-2 pr-2 font-mono text-slate-500">{log.id_log}</td>
                  <td className="py-2 px-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
                      {log.operacao}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-semibold text-white">{log.registro_id}</td>
                  <td className="py-2 px-2 font-mono text-[11px]">
                    {log.status_anterior ? `${log.status_anterior} → ${log.status_novo}` : log.status_novo}
                  </td>
                  <td className="py-2 pl-2 text-slate-400">
                    {new Date(log.registrado_em).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
