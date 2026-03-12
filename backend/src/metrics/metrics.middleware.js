import { Injectable, Dependencies } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Injectable()
@Dependencies(MetricsService)
export class MetricsMiddleware {
  constructor(metricsService) {
    this.metricsService = metricsService;
  }

  use(req, res, next) {
    const startPath = req.originalUrl || req.url;

    // Don't track metrics endpoints themselves
    if (startPath.startsWith('/api/metrics')) {
      return next();
    }

    res.on('finish', () => {
      try {
        this.metricsService.trackRequest({
          path: startPath,
          method: req.method,
          statusCode: res.statusCode,
          userAgent: req.headers['user-agent'],
          ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
          referer: req.headers['referer'] || req.headers['referrer'],
        });
      } catch {
        // Silently ignore tracking errors
      }
    });

    next();
  }
}
