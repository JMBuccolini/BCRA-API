import { Injectable } from '@nestjs/common';

@Injectable()
export class UvaService {
  constructor() {
    this.cache = null;
    this.cacheTime = null;
    this.CACHE_TTL = 60 * 60 * 1000; // 1 hora
  }

  async fetchUvaData() {
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.cache;
    }

    const res = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/uva', {
      redirect: 'follow',
    });
    if (!res.ok) throw new Error('Error al obtener datos UVA');
    const data = await res.json();

    this.cache = data;
    this.cacheTime = Date.now();
    return data;
  }

  async getEvolucion(meses = 12) {
    const data = await this.fetchUvaData();
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses);
    const desdeStr = desde.toISOString().split('T')[0];

    const filtered = data.filter((d) => d.fecha >= desdeStr);

    // Samplear a 1 dato por semana para no sobrecargar el gráfico
    const sampled = [];
    let lastDate = null;
    for (const item of filtered) {
      const itemDate = new Date(item.fecha);
      if (!lastDate || itemDate - lastDate >= 7 * 24 * 60 * 60 * 1000) {
        sampled.push(item);
        lastDate = itemDate;
      }
    }
    // Siempre incluir el último dato
    const last = filtered[filtered.length - 1];
    if (sampled[sampled.length - 1]?.fecha !== last?.fecha) {
      sampled.push(last);
    }

    return {
      total: sampled.length,
      valorActual: last?.valor || null,
      fechaActual: last?.fecha || null,
      data: sampled,
    };
  }
}
