import { useState } from 'react';
import AdminStats from './AdminStats';
import FlightsTable from './FlightsTable';
import CreateFlightModal from './CreateFlightModal';

export default function AdminDashboard() {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel do Administrador</h2>
          <p className="text-slate-400 text-sm mt-1">Gerencie voos ativos, horários e alocação de aeronaves do sistema.</p>
        </div>
        <button onClick={() => setCreating(true)} className="px-4 py-2.5 bg-decolae-600 hover:bg-decolae-500 text-white rounded-xl font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-decolae-600/20">
          <i className="fa-solid fa-plus" />
          <span>Novo Voo</span>
        </button>
      </div>
      <AdminStats />
      <FlightsTable />
      {creating && <CreateFlightModal onClose={() => setCreating(false)} />}
    </div>
  );
}
