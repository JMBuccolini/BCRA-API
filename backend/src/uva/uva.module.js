import { Module } from '@nestjs/common';
import { UvaController } from './uva.controller';
import { UvaService } from './uva.service';

@Module({
  controllers: [UvaController],
  providers: [UvaService],
})
export class UvaModule {}
