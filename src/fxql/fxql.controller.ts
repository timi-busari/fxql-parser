import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { ErrorResponse, FxqlRequestDto, FxqlResponseDto } from './dto/fxql.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiHeader } from '@nestjs/swagger';


@ApiTags('fxql')
@Controller('fxql-statements')
export class FxqlController {
  constructor(private readonly fxqlService: FxqlService) {}

 
  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiHeader({
    name: 'fxql-api-key',
    description: 'API key for authentication',
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized: invalid API key' })

  @ApiOperation({
    summary: 'Parse FXQL statement',
    description: 'Parses and saves FXQL statements for currency exchange rates',
  })
  @ApiResponse({
    status: 200,
    description: 'FXQL statements successfully parsed and saved',
    type: FxqlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponse,
  })
  async parseFxql(@Body() request: FxqlRequestDto) {
    const data = await this.fxqlService.parseAndSaveFxqlStatement(request.FXQL);

    return <FxqlResponseDto>{
      message: 'FXQL Statement Parsed Successfully.',
      code: 'FXQL-200',
      data,
    };
  }
}
