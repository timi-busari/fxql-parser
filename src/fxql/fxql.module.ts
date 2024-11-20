import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FxqlUtilService } from 'src/utils';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';

@Module({
  controllers: [FxqlController],
  providers: [FxqlService, PrismaService , FxqlUtilService],
})

export class FxqlModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(FxqlController); // apply to only FXQL routes
  }
}
