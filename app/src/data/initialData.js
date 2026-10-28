export const initialData = {
  routes: [
    { id: 1, origin: 'São Paulo (GRU)', destination: 'Rio de Janeiro (GIG)', distance: 360, time: '1h 05m' },
    { id: 2, origin: 'Brasília (BSB)', destination: 'Salvador (SSA)', distance: 1070, time: '2h 10m' },
    { id: 3, origin: 'Belo Horizonte (CNF)', destination: 'Belo Horizonte / Confins', distance: 520, time: '1h 20m' },
    { id: 4, origin: 'Curitiba (CWB)', destination: 'Porto Alegre (POA)', distance: 540, time: '1h 15m' },
  ],
  aircrafts: [
    { id: 1, code: 'PR-DCA', model: 'Boeing 737-800', capacity: 186, maker: 'Boeing', status: 'Ativa' },
    { id: 2, code: 'PR-DCB', model: 'Airbus A320neo', capacity: 174, maker: 'Airbus', status: 'Ativa' },
    { id: 3, code: 'PP-DCC', model: 'Embraer E195-E2', capacity: 136, maker: 'Embraer', status: 'Em Manutenção' },
  ],
  crew: [
    { id: 1, name: 'Capitão Roberto Alves', role: 'Piloto / Comandante', license: 'ANAC-10293', status: 'Disponível' },
    { id: 2, name: 'Fernanda Lima', role: 'Co-Piloto', license: 'ANAC-44910', status: 'Em Escala / Voo' },
    { id: 3, name: 'Lucas Mendes', role: 'Comissário(a) de Bordo', license: 'ANAC-99201', status: 'Disponível' },
    { id: 4, name: 'Juliana Costa', role: 'Chefe de Cabine', license: 'ANAC-33210', status: 'Folga / Licença' },
  ],
  flights: [
    { id: 1, code: 'DEC-1001', origin: 'São Paulo (GRU)', destination: 'Rio de Janeiro (GIG)', departure: '2026-11-01T08:30', arrival: '2026-11-01T09:35', aircraft: 'PR-DCA (Boeing 737-800)', price: 320, status: 'Confirmado' },
    { id: 2, code: 'DEC-2045', origin: 'Brasília (BSB)', destination: 'Salvador (SSA)', departure: '2026-11-02T14:15', arrival: '2026-11-02T16:25', aircraft: 'PR-DCB (Airbus A320neo)', price: 580, status: 'Programado' },
    { id: 3, code: 'DEC-3099', origin: 'Curitiba (CWB)', destination: 'Porto Alegre (POA)', departure: '2026-11-03T18:00', arrival: '2026-11-03T19:15', aircraft: 'PR-DCA (Boeing 737-800)', price: 290, status: 'Confirmado' },
  ],
  reservations: [
    { id: 101, flightCode: 'DEC-1001', origin: 'São Paulo (GRU)', destination: 'Rio de Janeiro (GIG)', departure: '2026-11-01 08:30', seat: '12A', price: 320 },
  ],
};
