import { Module } from '@nestjs/common';
import { BcraController } from './bcra.controller';
import { BcraService } from './bcra.service';

@Module({
  controllers: [BcraController],
  providers: [BcraService],
})
export class BcraModule {}
