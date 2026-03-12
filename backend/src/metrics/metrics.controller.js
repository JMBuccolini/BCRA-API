import {
  Controller,
  Dependencies,
  Get,
  Post,
  Bind,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.METRICS_SECRET || 'bcra-metrics-secret-change-me';
const METRICS_USER = process.env.METRICS_USER || 'admin';
const METRICS_PASS = process.env.METRICS_PASS || 'admin123';

function verifyToken(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
  }
  try {
    return jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    throw new HttpException('Token inválido o expirado', HttpStatus.UNAUTHORIZED);
  }
}

@Controller('metrics')
@Dependencies(MetricsService)
export class MetricsController {
  constructor(metricsService) {
    this.metricsService = metricsService;
  }

  @Post('login')
  @Bind(Body())
  login(body) {
    const { user, pass } = body || {};
    if (user !== METRICS_USER || pass !== METRICS_PASS) {
      throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
    }
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' });
    return { token };
  }

  @Get('summary')
  @Bind(Req())
  getSummary(req) {
    verifyToken(req);
    return this.metricsService.getSummary();
  }

  @Get('top-routes')
  @Bind(Req())
  getTopRoutes(req) {
    verifyToken(req);
    return this.metricsService.getTopRoutes();
  }

  @Get('daily')
  @Bind(Req())
  getDailyVisits(req) {
    verifyToken(req);
    return this.metricsService.getDailyVisits();
  }

  @Get('hourly')
  @Bind(Req())
  getHourly(req) {
    verifyToken(req);
    return this.metricsService.getHourlyDistribution();
  }

  @Get('devices')
  @Bind(Req())
  getDevices(req) {
    verifyToken(req);
    return this.metricsService.getDeviceStats();
  }

  @Get('referers')
  @Bind(Req())
  getReferers(req) {
    verifyToken(req);
    return this.metricsService.getReferers();
  }

  @Get('recent')
  @Bind(Req())
  getRecent(req) {
    verifyToken(req);
    return this.metricsService.getRecentRequests();
  }
}
