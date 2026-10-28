import { useData } from '../../context/DataContext';

export default function useAdminStats() {
  const { flights, aircrafts } = useData().data;
  return [
    { label: 'Total de Voos', value: flights.length, icon: 'fa-plane-up', tone: 'blue' },
    { label: 'Confirmados / Ativos', value: flights.filter((f) => f.status === 'Confirmado' || f.status === 'Em Voo').length, icon: 'fa-circle-check', tone: 'emerald' },
    { label: 'Programados', value: flights.filter((f) => f.status === 'Programado').length, icon: 'fa-clock', tone: 'amber' },
    { label: 'Aeronaves Em Uso', value: aircrafts.filter((a) => a.status === 'Ativa').length, icon: 'fa-plane', tone: 'indigo' },
  ];
}
