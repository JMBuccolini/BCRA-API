import { Module } from '@nestjs/common';
import { BcraModule } from './bcra/bcra.module';
import { UvaModule } from './uva/uva.module';
import { NoticiasModule } from './noticias/noticias.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';

@Module({
  imports: [BcraModule, UvaModule, NoticiasModule, MetricsModule],
})
export class AppModule {
  configure(consumer) {
    consumer.apply(MetricsMiddleware).forRoutes('{*path}');
  }
}
