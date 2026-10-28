const TONES = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  red: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
  slate: 'bg-slate-700 text-slate-300',
};

export default function Badge({ tone = 'slate', children }) {
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${TONES[tone]}`}>{children}</span>;
}
