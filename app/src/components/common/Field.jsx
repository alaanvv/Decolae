const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white';

// Com `options` renderiza <select>; sem, renderiza <input>.
export default function Field({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-xs text-slate-300 mb-1">{label}</label>
      {options ? (
        <select className={inputCls} {...props}>
          {options.map((o) => {
            const value = o.value ?? o;
            return <option key={value} value={value}>{o.label ?? o}</option>;
          })}
        </select>
      ) : (
        <input className={inputCls} {...props} />
      )}
    </div>
  );
}
