import useNavbar from './useNavbar';

export default function Navbar() {
  const { user, handleLogout } = useNavbar();
  return (
    <header className="bg-slate-800 border-b border-slate-700/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-decolae-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            <i className="fa-solid fa-plane-departure" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white">DECOLAE</span>
            <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">{user.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition" title="Sair">
            <i className="fa-solid fa-right-from-bracket text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
}
