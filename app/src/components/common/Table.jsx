export default function Table({ headers, header, isEmpty = false, empty, children }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/60 overflow-hidden shadow-lg">
      {header}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-700/50">
            <tr>{headers.map((h) => <th key={h} className="p-4">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {isEmpty ? (
              <tr><td colSpan={headers.length} className="text-center p-6 text-slate-500">{empty}</td></tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
