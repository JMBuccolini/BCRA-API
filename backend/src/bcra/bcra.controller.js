import {
  Controller,
  Dependencies,
  Get,
  Param,
  Query,
  Bind,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BcraService } from './bcra.service';

const VALID_CATEGORIES = [
  'cajasDeAhorro',
  'plazosFijos',
  'tarjetas',
  'personales',
  'hipotecarios',
  'prendarios',
  'paquetes',
];

@Controller('transparencia')
@Dependencies(BcraService)
export class BcraController {
  constructor(bcraService) {
    this.bcraService = bcraService;
  }

  @Get('categorias')
  getCategorias() {
    return VALID_CATEGORIES.map((id) => ({
      id,
      nombre: {
        cajasDeAhorro: 'Cajas de Ahorro',
        plazosFijos: 'Plazos Fijos',
        tarjetas: 'Tarjetas de Crédito',
        personales: 'Préstamos Personales',
        hipotecarios: 'Préstamos Hipotecarios',
        prendarios: 'Préstamos Prendarios',
        paquetes: 'Paquetes de Productos',
      }[id],
    }));
  }

  @Get(':category/entidades')
  @Bind(Param('category'))
  async getEntidades(category) {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new HttpException('Categoría inválida', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.bcraService.getEntidades(category);
    } catch (error) {
      throw new HttpException(
        `Error al obtener entidades: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':category')
  @Bind(Param('category'), Query())
  async getCategory(category, query) {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new HttpException(
        `Categoría inválida. Válidas: ${VALID_CATEGORIES.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const data = await this.bcraService.getCategory(category, query);
      return { category, total: data.length, data };
    } catch (error) {
      throw new HttpException(
        `Error al obtener datos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
