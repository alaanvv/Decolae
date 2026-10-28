const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-decolae-500';

export default function SearchHero({ filters, onChange, onReset }) {
  return (
    <div className="bg-gradient-to-r from-decolae-900 via-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
      <div className="max-w-2xl">
        <span className="inline-block px-3 py-1 bg-decolae-500/20 text-decolae-400 text-xs font-semibold rounded-full mb-3 border border-decolae-500/30">Portal do Passageiro</span>
        <h2 className="text-3xl font-extrabold text-white">Para onde você deseja voar hoje?</h2>
        <p className="text-slate-300 text-sm mt-2">Encontre voos comerciais para os principais destinos com total segurança e comodidade.</p>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Origem / Destino</label>
          <input type="text" value={filters.term} onChange={(e) => onChange('term', e.target.value)} placeholder="Ex: São Paulo ou Rio de Janeiro..." className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Data Mínima</label>
          <input type="date" value={filters.date} onChange={(e) => onChange('date', e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-end">
          <button onClick={onReset} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition">Limpar Filtros</button>
        </div>
      </div>
    </div>
  );
}
