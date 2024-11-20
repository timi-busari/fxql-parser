import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FxqlRequestDto {
  @ApiProperty({
    description: 'FXQL statement text',
    example: 'USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }',
  })
  @IsString()
  @IsNotEmpty()
  FXQL: string;
}

export class FxqlEntry {
  @ApiProperty({
    description: 'Unique identifier for the FXQL entry',
    example: 1,
  })
  EntryId: number;

  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
  })
  SourceCurrency: string;

  @ApiProperty({
    description: 'Destination currency code',
    example: 'EUR',
  })
  DestinationCurrency: string;

  @ApiProperty({
    description: 'Sell price for the currency pair',
    example: 1.1,
  })
  SellPrice: number;

  @ApiProperty({
    description: 'Buy price for the currency pair',
    example: 1.05,
  })
  BuyPrice: number;

  @ApiProperty({
    description: 'Cap amount for the currency pair',
    example: 1000,
  })
  CapAmount: number;
}

export class FxqlResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'FXQL Statement Parsed Successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Response code',
    example: 'FXQL-200',
  })
  code: string;

  @ApiProperty({
    description: 'Parsed FXQL entries',
    type: [FxqlEntry],
  })
  data: FxqlEntry[];
}

export class ErrorResponse {
  @ApiProperty({
    description: 'Error message',
    example: 'Validation error occured',
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'FXQL-400',
  })
  code: string;

  @ApiProperty({
    description: 'Detailed error information',
    required: false,
  })
  errors?: [];
}
