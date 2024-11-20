import { BadRequestException } from '@nestjs/common';

export class CustomException extends BadRequestException {
  constructor(message: string, errors?) {
    super({
      message: message,
      code: 'FXQL-400',
      errors
    });
  }
}
