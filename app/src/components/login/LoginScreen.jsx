import useLogin from './useLogin';

const QUICK_PROFILES = [
  { type: 'admin', label: 'Admin', icon: 'fa-user-shield text-indigo-400' },
  { type: 'gerente', label: 'Gerente', icon: 'fa-user-gear text-amber-400' },
  { type: 'cliente', label: 'Cliente', icon: 'fa-user text-emerald-400' },
];

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-decolae-500 focus:ring-1 focus:ring-decolae-500';

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, fillProfile, submit } = useLogin();
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-decolae-900">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-decolae-500/20 text-decolae-500 mb-4 border border-decolae-500/30">
            <i className="fa-solid font-bold fa-plane-departure text-3xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">DECOLAE</h1>
          <p className="text-sm text-slate-400 mt-1">Plataforma de Gestão & Reservas de Aviação</p>
        </div>

        <div className="mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Acesso Rápido para Testes:</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_PROFILES.map((p) => (
              <button key={p.type} type="button" onClick={() => fillProfile(p.type)} className="py-2 px-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 transition flex flex-col items-center gap-1">
                <i className={`fa-solid ${p.icon}`} /> {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-mail de Acesso</label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@decolae.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </div>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-decolae-600 hover:bg-decolae-500 text-white font-medium rounded-lg shadow-lg shadow-decolae-600/30 transition duration-200 flex items-center justify-center gap-2">
            <span>Entrar no Sistema</span>
            <i className="fa-solid fa-arrow-right text-sm" />
          </button>
        </form>
      </div>
    </div>
  );
}
