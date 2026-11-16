// Camada de acesso à API Decolaê. Converte os campos da API para o formato usado na UI.
const BASE = import.meta.env.VITE_API_URL ?? '/api'; // '/api' usa o proxy do Vite (ver vite.config.js)

const DEFAULT_ERRORS = {
  400: 'Dados inválidos ou campos obrigatórios ausentes.',
  404: 'Registro não encontrado.',
  409: 'Registro já cadastrado.',
};

async function http(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar à API.');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.erro || json?.error || json?.message || DEFAULT_ERRORS[res.status] || `Erro ${res.status}`);
  }
  return json;
}

const asList = (r) => (Array.isArray(r) ? r : []);
const post = (path, body) => http(path, { method: 'POST', body });
const put = (path, body) => http(path, { method: 'PUT', body });
const patch = (path, body) => http(path, { method: 'PATCH', body });
const remove = (path) => http(path, { method: 'DELETE' });

export const resources = {
  routes: {
    list: async () =>
      asList(await http('/trajetos')).map((t) => ({
        id: t.id_trajeto ?? t.id,
        origin: t.cidade_origem,
        destination: t.cidade_destino,
      })),
    create: (v) => post('/trajetos', { cidade_origem: v.origin.trim(), cidade_destino: v.destination.trim() }),
    update: (id, v) => put(`/trajetos/${encodeURIComponent(id)}`, { cidade_origem: v.origin.trim(), cidade_destino: v.destination.trim() }),
    remove: (id) => remove(`/trajetos/${encodeURIComponent(id)}`),
  },
  aircrafts: {
    list: async () =>
      asList(await http('/aeronaves')).map((a) => ({
        id: a.identificacao,
        code: a.identificacao,
        model: a.modelo,
        capacity: a.quantidade_assentos,
      })),
    create: (v) =>
      post('/aeronaves', {
        identificacao: v.code.trim().toUpperCase(),
        modelo: v.model.trim(),
        quantidade_assentos: Number(v.capacity),
      }),
    update: (id, v) => put(`/aeronaves/${encodeURIComponent(id)}`, {
      identificacao: v.code.trim().toUpperCase(),
      modelo: v.model.trim(),
      quantidade_assentos: Number(v.capacity),
    }),
    remove: (id) => remove(`/aeronaves/${encodeURIComponent(id)}`),
  },
  crew: {
    list: async () => asList(await http('/tripulantes')).map((c) => ({ id: c.cpf.trim(), name: c.nome, cpf: c.cpf.trim() })),
    create: (v) => post('/tripulantes', { cpf: v.cpf.replace(/\D/g, ''), nome: v.name.trim() }),
    update: (id, v) => put(`/tripulantes/${encodeURIComponent(id)}`, { cpf: v.cpf.replace(/\D/g, ''), nome: v.name.trim() }),
    remove: (id) => remove(`/tripulantes/${encodeURIComponent(id)}`),
  },
  flights: {
    // Ajuste aqui se o GET /voos devolver nomes de campos diferentes.
    list: async () =>
      asList(await http('/voos')).map((f) => ({
        id: f.numero_voo,
        code: f.numero_voo,
        origin: f.cidade_origem ?? f.origem,
        destination: f.cidade_destino ?? f.destino,
        routeId: f.id_trajeto,
        departure: f.previsao_partida,
        arrival: f.previsao_chegada,
        aircraft: f.id_aeronave ?? f.aeronave,
        aircraftModel: f.modelo_aeronave,
        capacity: f.quantidade_assentos,
        seatsAvailable: f.assentos_disponiveis ?? [],
        availableSeats: f.quantidade_assentos_disponiveis ?? 0,
        canBook: f.compra_aberta,
        price: Number(f.preco_passagem ?? 450),
        status: f.status,
      })),
    create: (v) =>
      post('/voos', {
        numero_voo: v.code.trim().toUpperCase(),
        previsao_partida: new Date(v.departure).toISOString(),
        previsao_chegada: new Date(v.arrival).toISOString(),
        id_trajeto: Number(v.route),
        id_aeronave: v.aircraft,
      }),
    update: (id, v) => put(`/voos/${encodeURIComponent(id)}`, {
      previsao_partida: new Date(v.departure).toISOString(),
      previsao_chegada: new Date(v.arrival).toISOString(),
      id_trajeto: Number(v.route),
      id_aeronave: v.aircraft,
    }),
    remove: (id) => remove(`/voos/${encodeURIComponent(id)}`),
    crew: async (flight) => asList(await http(`/voos/${encodeURIComponent(flight)}/tripulantes`)),
    assignCrew: (flight, member, role) => post(`/voos/${encodeURIComponent(flight)}/tripulantes`, { cpf_tripulante: member, funcao_no_voo: role }),
    removeCrew: (flight, member) => remove(`/voos/${encodeURIComponent(flight)}/tripulantes/${encodeURIComponent(member)}`),
    setStatus: (flight, status) => patch(`/voos/${encodeURIComponent(flight)}/status`, { status }),
  },
  passages: {
    list: async () => asList(await http('/passagens')).map((p) => ({
      id: p.numero_bilhete.trim(),
      seat: p.numero_assento,
      purchaseDate: p.data_compra,
      price: Number(p.preco),
      status: p.status,
      flightCode: p.numero_voo,
      origin: p.cidade_origem,
      destination: p.cidade_destino,
      departure: p.previsao_partida,
    })),
    create: (flight, seat) => post('/passagens', { numero_voo: flight, numero_assento: Number(seat) }),
    cancel: (id) => patch(`/passagens/${encodeURIComponent(id)}/cancelar`, {}),
  },
};

export const authApi = {
  login: async (email, senha) => {
    const r = await post('/auth/login', { email, senha });
    return r.usuario ?? r;
  },
  session: () => http('/auth/session'),
  logout: () => post('/auth/logout', {}),
  register: (v) => post('/auth/register', { email: v.email, nome: v.nome, senha: v.senha, cpf: v.cpf, telefone: v.telefone }),
};
