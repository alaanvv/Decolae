import useLogin from './useLogin';

const QUICK_PROFILES = [
  { type: 'admin', label: 'Admin', icon: 'fa-user-shield text-indigo-400' },
  { type: 'gerente', label: 'Gerente', icon: 'fa-user-gear text-amber-400' },
  { type: 'cliente', label: 'Cliente', icon: 'fa-user text-emerald-400' },
];

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-decolae-500 focus:ring-1 focus:ring-decolae-500';

function IconInput({ label, icon, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative">
        <i className={`fa-solid ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
        <input required className={inputCls} {...props} />
      </div>
    </div>
  );
}

export default function LoginScreen() {
  const { mode, setMode, loading, bind, fillProfile, submit } = useLogin();
  const isRegister = mode === 'register';
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

        {!isRegister && (
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
        )}

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <>
              <IconInput label="Nome Completo" icon="fa-user" placeholder="Gabriel Silva" {...bind('nome')} />
              <div className="grid grid-cols-2 gap-3">
                <IconInput label="CPF" icon="fa-id-card" placeholder="12345678901" {...bind('cpf')} />
                <IconInput label="Telefone" icon="fa-phone" placeholder="31999999999" {...bind('telefone')} />
              </div>
            </>
          )}
          <IconInput label="E-mail de Acesso" icon="fa-envelope" type="email" placeholder="seu.email@decolae.com" {...bind('email')} />
          <IconInput label="Senha" icon="fa-lock" type="password" {...bind('senha')} />
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-decolae-600 hover:bg-decolae-500 disabled:opacity-60 text-white font-medium rounded-lg shadow-lg shadow-decolae-600/30 transition duration-200 flex items-center justify-center gap-2">
            <span>{loading ? 'Aguarde...' : isRegister ? 'Criar Conta de Cliente' : 'Entrar no Sistema'}</span>
            <i className="fa-solid fa-arrow-right text-sm" />
          </button>
        </form>

        <button type="button" onClick={() => setMode(isRegister ? 'login' : 'register')} className="mt-4 w-full text-xs text-decolae-400 hover:underline">
          {isRegister ? 'Já tenho conta — entrar' : 'Não tem conta? Cadastre-se como cliente'}
        </button>
      </div>
    </div>
  );
}
