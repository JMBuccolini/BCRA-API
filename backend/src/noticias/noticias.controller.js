import { Controller, Dependencies, Get, HttpException, HttpStatus } from '@nestjs/common';
import { NoticiasService } from './noticias.service';

@Controller('noticias')
@Dependencies(NoticiasService)
export class NoticiasController {
  constructor(noticiasService) {
    this.noticiasService = noticiasService;
  }

  @Get()
  async getNoticias() {
    try {
      const noticias = await this.noticiasService.fetchNoticias();
      return { total: noticias.length, data: noticias };
    } catch (err) {
      throw new HttpException(
        err.message || 'Error al obtener noticias',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
