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

export const resources = {
  routes: {
    list: async () =>
      asList(await http('/trajetos')).map((t) => ({
        id: t.id_trajeto ?? t.id,
        origin: t.cidade_origem,
        destination: t.cidade_destino,
      })),
    create: (v) => post('/trajetos', { cidade_origem: v.origin.trim(), cidade_destino: v.destination.trim() }),
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
  },
  crew: {
    list: async () => asList(await http('/tripulantes')).map((c) => ({ id: c.cpf, name: c.nome, cpf: c.cpf })),
    create: (v) => post('/tripulantes', { cpf: v.cpf.replace(/\D/g, ''), nome: v.name.trim() }),
  },
  flights: {
    // Ajuste aqui se o GET /voos devolver nomes de campos diferentes.
    list: async () =>
      asList(await http('/voos')).map((f) => ({
        id: f.numero_voo,
        code: f.numero_voo,
        origin: f.cidade_origem ?? f.origem,
        destination: f.cidade_destino ?? f.destino,
        departure: f.previsao_partida,
        arrival: f.previsao_chegada,
        aircraft: f.id_aeronave ?? f.aeronave,
        status: f.status,
      })),
    create: (v) =>
      post('/voos', {
        numero_voo: v.code.trim().toUpperCase(),
        status: v.status,
        previsao_partida: new Date(v.departure).toISOString(),
        previsao_chegada: new Date(v.arrival).toISOString(),
        id_trajeto: Number(v.route),
        id_aeronave: v.aircraft,
      }),
  },
};

export const authApi = {
  login: async (email, senha) => {
    const r = await post('/auth/login', { email, senha });
    return r.usuario ?? r;
  },
  register: (v) => post('/auth/register', { email: v.email, nome: v.nome, senha: v.senha, cpf: v.cpf, telefone: v.telefone }),
};
