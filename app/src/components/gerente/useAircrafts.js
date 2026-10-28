import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useAircrafts() {
  const { data, update } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const toggleStatus = (aircraft) => {
    update('aircrafts', aircraft.id, { status: aircraft.status === 'Ativa' ? 'Em Manutenção' : 'Ativa' });
    toast(`Status da aeronave ${aircraft.code} atualizado.`, 'info');
  };

  return { aircrafts: data.aircrafts, open, setOpen, toggleStatus };
}
