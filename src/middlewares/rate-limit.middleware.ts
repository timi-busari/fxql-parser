import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { CustomException } from 'src/utils/custom-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter;

  constructor(private configService: ConfigService) {
    this.limiter = rateLimit({
      windowMs: this.configService.get<number>(
        'RATE_LIMIT_WINDOW_MS',
        10 * 60 * 1000,
      ), // Default 10 minutes
      max: this.configService.get<number>('RATE_LIMIT_MAX', 10), // Default 10 requests
      message: new CustomException(
        'Too many requests, please try again later',
      ).getResponse(),
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}
