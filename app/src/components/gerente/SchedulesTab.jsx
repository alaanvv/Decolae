import { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { resources } from '../../services/api';
import SectionHeader from '../common/SectionHeader';

const ROLES = ['COMANDANTE', 'COPILOTO', 'COMISSARIO', 'MECANICO'];

function FlightSchedule({ flight, crewOptions, reloadFlights }) {
  const [assigned, setAssigned] = useState([]);
  const [member, setMember] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const reload = async () => setAssigned(await resources.flights.crew(flight.code));

  useEffect(() => {
    reload().catch((error) => toast(error.message, 'error'));
  }, [flight.code]);

  const assign = async (event) => {
    event.preventDefault();
    if (!member) return;
    setBusy(true);
    try {
      await resources.flights.assignCrew(flight.code, member, role);
      await reload();
      setMember('');
      toast('Tripulante adicionado à escala.', 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cpf) => {
    if (!window.confirm('Remover este tripulante da escala?')) return;
    try {
      await resources.flights.removeCrew(flight.code, cpf);
      await reload();
      toast('Tripulante removido da escala.', 'info');
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const schedule = async () => {
    setBusy(true);
    try {
      const nextStatus = flight.status === 'PLANEJAMENTO' ? 'PROGRAMADO' : 'PLANEJAMENTO';
      await resources.flights.setStatus(flight.code, nextStatus);
      await reloadFlights();
      toast(nextStatus === 'PROGRAMADO' ? 'Voo programado.' : 'Voo reaberto para planejamento.', 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const assignedIds = new Set(assigned.map((item) => item.cpf.trim()));
  const available = crewOptions.filter((item) => !assignedIds.has(item.id.trim()));
  const counts = Object.fromEntries(ROLES.map((name) => [name, assigned.filter((item) => item.funcao_no_voo === name).length]));

  return (
    <article className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 space-y-4">
      <header className="flex flex-wrap justify-between gap-2">
        <div>
          <h3 className="text-white font-bold">{flight.code}: {flight.origin} → {flight.destination}</h3>
          <p className="text-xs text-slate-400">{new Date(flight.departure).toLocaleString()} · {flight.aircraft}</p>
        </div>
        <span className="text-xs text-slate-300">{flight.status}</span>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        {ROLES.slice(0, 3).map((name) => <span key={name} className="px-2 py-1 rounded bg-slate-900 text-slate-300">{name}: {counts[name] ?? 0}</span>)}
      </div>

      {assigned.length > 0 && <ul className="divide-y divide-slate-700">
        {assigned.map((item) => <li key={item.cpf} className="py-2 flex items-center justify-between text-sm">
          <span className="text-slate-200">{item.nome} <span className="text-slate-500">· {item.funcao_no_voo}</span></span>
          {flight.status === 'PLANEJAMENTO' && <button type="button" onClick={() => remove(item.cpf)} className="text-xs text-rose-400 hover:text-rose-300">Remover</button>}
        </li>)}
      </ul>}

      {flight.status === 'PLANEJAMENTO' && <form onSubmit={assign} className="flex flex-wrap gap-2">
        <select required value={member} onChange={(event) => setMember(event.target.value)} className="flex-1 min-w-40 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
          <option value="">Selecionar tripulante</option>
          {available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
          {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button disabled={busy || !available.length} className="px-3 py-2 rounded-lg bg-slate-700 text-xs text-white disabled:opacity-50">Adicionar</button>
      </form>}

      {(flight.status === 'PLANEJAMENTO' || flight.status === 'PROGRAMADO') && <button type="button" disabled={busy} onClick={schedule} className="px-3 py-2 rounded-lg bg-decolae-600 text-xs text-white disabled:opacity-50">{flight.status === 'PLANEJAMENTO' ? 'Programar voo' : 'Reabrir planejamento'}</button>}
    </article>
  );
}

export default function SchedulesTab() {
  const { data, reload } = useData();
  return (
    <>
      <SectionHeader title="Escalas de Tripulação" />
      <p className="text-sm text-slate-400">Associe a tripulação antes de programar o voo. É necessário um comandante, um copiloto e dois comissários.</p>
      {data.flights.length ? <div className="space-y-4">
        {data.flights.map((flight) => <FlightSchedule key={flight.id} flight={flight} crewOptions={data.crew} reloadFlights={() => reload(['flights'])} />)}
      </div> : <p className="p-6 text-center text-slate-400 bg-slate-800 rounded-2xl">Nenhum voo cadastrado.</p>}
    </>
  );
}
