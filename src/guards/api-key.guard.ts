import { Injectable, CanActivate, ExecutionContext, applyDecorators, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['fxql-api-key'];
    
    if (!apiKey) {
      throw new CustomException('API key is missing');
    }

    const validApiKey = this.configService.get<string>('API_KEY');
    
    if (apiKey !== validApiKey) {
      throw new CustomException('Invalid API key');
    }

    return true;
  }
}


  