import { Children, cloneElement, isValidElement } from 'react';

// Em telas pequenas (< md) cada linha vira um card: o cabeçalho de cada coluna
// é injetado como `data-label` no <td> e exibido via CSS (.responsive-table em index.css).
function labelCells(row, headers) {
  if (!isValidElement(row)) return row;
  let i = 0;
  const cells = Children.map(row.props.children, (cell) =>
    isValidElement(cell) ? cloneElement(cell, { 'data-label': headers[i++] || undefined }) : cell
  );
  return cloneElement(row, {}, cells);
}

export default function Table({ headers, header, isEmpty = false, empty, children }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/60 overflow-hidden shadow-lg">
      {header}
      <div className="md:overflow-x-auto custom-scrollbar">
        <table className="responsive-table w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-700/50">
            <tr>{headers.map((h, i) => <th key={h || i} className="p-4">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {isEmpty ? (
              <tr><td colSpan={headers.length} className="text-center p-6 text-slate-500">{empty}</td></tr>
            ) : Children.map(children, (row) => labelCells(row, headers))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
