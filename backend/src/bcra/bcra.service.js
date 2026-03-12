import { Injectable } from '@nestjs/common';

const BASE_URL = 'https://www.bcra.gob.ar/archivos/Pdfs/BCRAyVos';

const CSV_SOURCES = {
  cajasDeAhorro: `${BASE_URL}/CAJADEAHORROS.CSV`,
  plazosFijos: `${BASE_URL}/PFIJO.CSV`,
  tarjetas: `${BASE_URL}/TARJETAS.CSV`,
  personales: `${BASE_URL}/PERSONALES.CSV`,
  hipotecarios: `${BASE_URL}/HIPOTECA.CSV`,
  prendarios: `${BASE_URL}/PRENDARIOS.CSV`,
  paquetes: `${BASE_URL}/PAQUETE.CSV`,
};

const HEADERS_MAP = {
  cajasDeAhorro: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'procesoSimplificado',
  ],
  plazosFijos: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'denominacion',
    'montoMinimo',
    'plazoMinimo',
    'canalConstitucion',
    'tasaEfectivaAnual',
    'territorio',
    'masInformacion',
  ],
  tarjetas: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'comisionAdministracion',
    'comisionRenovacion',
    'teaCompensatorio',
    'teaAdelantoEfectivo',
    'ingresoMinimo',
    'antiguedadLaboral',
    'edadMaxima',
    'segmento',
    'territorio',
    'masInformacion',
  ],
  personales: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'denominacion',
    'montoMaximo',
    'montoMinimo',
    'plazoMaximo',
    'ingresoMinimo',
    'antiguedadLaboral',
    'edadMaxima',
    'relacionCuotaIngreso',
    'beneficiario',
    'cargoCancelacion',
    'teaMaxima',
    'tipoTasa',
    'cfteaMaximo',
    'cuotaInicial',
    'territorio',
    'masInformacion',
  ],
  hipotecarios: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'denominacion',
    'montoMaximo',
    'plazoMaximo',
    'ingresoMinimo',
    'antiguedadLaboral',
    'edadMaxima',
    'relacionCuotaIngreso',
    'relacionMontoTasacion',
    'destinoFondos',
    'beneficiarios',
    'cargoCancelacion',
    'teaMaxima',
    'tipoTasa',
    'cfteaMaximo',
    'cuotaInicial',
    'territorio',
    'masInformacion',
  ],
  prendarios: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'denominacion',
    'montoMaximo',
    'montoMinimo',
    'plazoMaximo',
    'ingresoMinimo',
    'antiguedadLaboral',
    'edadMaxima',
    'relacionCuotaIngreso',
    'relacionMontoTasacion',
    'destinoFondos',
    'beneficiario',
    'cargoCancelacion',
    'teaMaxima',
    'tipoTasa',
    'cfteaMaximo',
    'cuotaInicial',
    'territorio',
    'masInformacion',
  ],
  paquetes: [
    'codigoEntidad',
    'entidad',
    'fechaInformacion',
    'nombreCompleto',
    'nombreCorto',
    'comisionMantenimiento',
    'ingresoMinimo',
    'antiguedadLaboral',
    'edadMaxima',
    'beneficiarios',
    'segmento',
    'productosIntegrantes',
    'territorio',
    'masInformacion',
  ],
};

@Injectable()
export class BcraService {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 30 * 60 * 1000;
  }

  parseCsv(text, headerKeys) {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const values = line.split(';');
      const obj = {};
      headerKeys.forEach((key, i) => {
        obj[key] = (values[i] || '').trim();
      });
      return obj;
    });
  }

  async fetchCsv(category) {
    const url = CSV_SOURCES[category];
    if (!url) throw new Error(`Categoría desconocida: ${category}`);

    const cached = this.cache.get(category);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener ${category}: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const text = new TextDecoder('latin1').decode(buffer);
    const data = this.parseCsv(text, HEADERS_MAP[category]);

    this.cache.set(category, { data, timestamp: Date.now() });
    return data;
  }

  async getCategory(category, filters = {}) {
    let data = await this.fetchCsv(category);

    if (filters.entidad) {
      const search = filters.entidad.toLowerCase();
      data = data.filter((item) =>
        item.entidad?.toLowerCase().includes(search),
      );
    }

    if (filters.denominacion) {
      const search = filters.denominacion.toLowerCase();
      data = data.filter((item) =>
        item.denominacion?.toLowerCase().includes(search),
      );
    }

    if (filters.segmento) {
      const search = filters.segmento.toLowerCase();
      data = data.filter((item) =>
        item.segmento?.toLowerCase().includes(search),
      );
    }

    return data;
  }

  async getEntidades(category) {
    const data = await this.fetchCsv(category);
    const entidades = [...new Set(data.map((d) => d.entidad).filter(Boolean))];
    entidades.sort();
    return entidades;
  }
}
