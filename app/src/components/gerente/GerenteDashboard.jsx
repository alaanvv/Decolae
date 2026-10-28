import { useState } from 'react';
import RoutesTab from './RoutesTab';
import AircraftsTab from './AircraftsTab';
import CrewTab from './CrewTab';

const TABS = [
  { id: 'trajetos', label: 'Trajetos', icon: 'fa-route', Content: RoutesTab },
  { id: 'aeronaves', label: 'Aeronaves', icon: 'fa-plane text-sm', Content: AircraftsTab },
  { id: 'tripulantes', label: 'Tripulantes', icon: 'fa-id-card', Content: CrewTab },
];

export default function GerenteDashboard() {
  const [active, setActive] = useState('trajetos');
  const { Content } = TABS.find((t) => t.id === active);
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
        <h2 className="text-2xl font-bold text-white">Painel do Gerente Operacional</h2>
        <p className="text-slate-400 text-sm mt-1">Controle de infraestrutura: trajetos rotineiros, frota de aeronaves e escalas da equipe.</p>
      </div>
      <div className="flex border-b border-slate-700">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} className={`px-6 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${active === t.id ? 'border-decolae-500 text-decolae-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-4"><Content /></div>
    </div>
  );
}
