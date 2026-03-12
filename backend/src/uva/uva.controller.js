import { Controller, Dependencies, Get, Query, Bind, HttpException, HttpStatus } from '@nestjs/common';
import { UvaService } from './uva.service';

@Controller('uva')
@Dependencies(UvaService)
export class UvaController {
  constructor(uvaService) {
    this.uvaService = uvaService;
  }

  @Get('evolucion')
  @Bind(Query())
  async getEvolucion(query) {
    try {
      const m = query.meses ? parseInt(query.meses) : 12;
      return await this.uvaService.getEvolucion(m);
    } catch (err) {
      throw new HttpException(
        err.message || 'Error al obtener evolución UVA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
