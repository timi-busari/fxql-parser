import { Module } from '@nestjs/common';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    FxqlModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService, ConfigService],
  controllers:[AppController]
})
export class AppModule {}
