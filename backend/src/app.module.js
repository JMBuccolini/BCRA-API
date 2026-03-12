import { Module } from '@nestjs/common';
import { BcraModule } from './bcra/bcra.module';

@Module({
  imports: [BcraModule],
})
export class AppModule {}
