export const FLIGHT_STATUS = {
  PLANEJAMENTO: { label: 'Planejamento', tone: 'slate' },
  PROGRAMADO: { label: 'Programado', tone: 'blue' },
  ATRASADO: { label: 'Atrasado', tone: 'red' },
  EMBARQUE: { label: 'Embarque', tone: 'amber' },
  EM_ANDAMENTO: { label: 'Em Andamento', tone: 'amber' },
  CONCLUIDO: { label: 'Concluído', tone: 'green' },
  CANCELADO: { label: 'Cancelado', tone: 'red' },
};

export const STATUS_OPTIONS = Object.entries(FLIGHT_STATUS).map(([value, { label }]) => ({ value, label }));
export const statusInfo = (s) => FLIGHT_STATUS[s] ?? { label: s, tone: 'slate' };
export const isBookable = (s) => s !== 'CANCELADO' && s !== 'CONCLUIDO';
