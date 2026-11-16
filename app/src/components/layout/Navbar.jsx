import useNavbar from './useNavbar';

export default function Navbar() {
  const { user, handleLogout } = useNavbar();
  return (
    <header className="bg-slate-800 border-b border-slate-700/80 sticky top-0 z-40 pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-decolae-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
            <i className="fa-solid fa-plane-departure" />
          </div>
          <div className="flex items-center min-w-0">
            <span className="text-lg sm:text-xl font-extrabold tracking-wider text-white">DECOLAE</span>
            <span className="ml-2 truncate text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">{user.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition" title="Sair" aria-label="Sair">
            <i className="fa-solid fa-right-from-bracket text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
}
