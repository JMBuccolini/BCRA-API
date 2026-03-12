import { Module } from '@nestjs/common';
import { BcraModule } from './bcra/bcra.module';
import { UvaModule } from './uva/uva.module';
import { NoticiasModule } from './noticias/noticias.module';

@Module({
  imports: [BcraModule, UvaModule, NoticiasModule],
})
export class AppModule {}
