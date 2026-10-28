import { useData } from '../../context/DataContext';

export default function useAdminStats() {
  const { flights, aircrafts } = useData().data;
  const count = (...s) => flights.filter((f) => s.includes(f.status)).length;
  return [
    { label: 'Total de Voos', value: flights.length, icon: 'fa-plane-up', tone: 'blue' },
    { label: 'Em Operação', value: count('EMBARQUE', 'EM_ANDAMENTO'), icon: 'fa-circle-check', tone: 'emerald' },
    { label: 'Programados', value: count('PROGRAMADO'), icon: 'fa-clock', tone: 'amber' },
    { label: 'Aeronaves Cadastradas', value: aircrafts.length, icon: 'fa-plane', tone: 'indigo' },
  ];
}
