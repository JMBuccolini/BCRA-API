const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = API_URL + '/api/transparencia';

export async function fetchCategorias() {
  const res = await fetch(`${API_BASE}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
}

export async function fetchCategory(category, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  const url = `${API_BASE}/${category}${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener datos');
  return res.json();
}

export async function fetchEntidades(category) {
  const res = await fetch(`${API_BASE}/${category}/entidades`);
  if (!res.ok) throw new Error('Error al obtener entidades');
  return res.json();
}

export async function fetchUvaEvolucion(meses = 12) {
  const res = await fetch(`${API_URL}/api/uva/evolucion?meses=${meses}`);
  if (!res.ok) throw new Error('Error al obtener datos UVA');
  return res.json();
}

export async function fetchNoticias() {
  const res = await fetch(`${API_URL}/api/noticias`);
  if (!res.ok) throw new Error('Error al obtener noticias');
  return res.json();
}
