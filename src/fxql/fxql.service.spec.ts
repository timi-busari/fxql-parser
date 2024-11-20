// src/fxql/fxql.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FxqlService } from './fxql.service';
import { PrismaService } from '../prisma/prisma.service';
import { FxqlUtilService } from '../utils';
import { Logger } from '@nestjs/common';
import { CustomException } from '../utils/custom-exception';

describe('FxqlService', () => {
  let service: FxqlService;
  let prismaService: PrismaService;
  let utilService: FxqlUtilService;

  const mockPrismaService = {
    fxqlStatement: {
      upsert: jest.fn(),
    },
  };

  const mockUtilService = {
    validateCurrencyAndPrices: jest.fn(),
    validateCurrency: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FxqlUtilService,
          useValue: mockUtilService,
        },
      ],
    }).compile();

    service = module.get<FxqlService>(FxqlService);
    prismaService = module.get<PrismaService>(PrismaService);
    utilService = module.get<FxqlUtilService>(FxqlUtilService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAndSaveFxqlStatement', () => {
    const validFxqlText = 'USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }';
    const validParsedStatement = {
      sourceCurrency: 'USD',
      destinationCurrency: 'EUR',
      buyPrice: 1.05,
      sellPrice: 1.10,
      capAmount: 1000,
    };

    const mockSavedRate = {
      id: 1,
      ...validParsedStatement,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockPrismaService.fxqlStatement.upsert.mockResolvedValue(mockSavedRate);
    });

    it('should successfully parse and save a valid FXQL statement', async () => {
      const result = await service.parseAndSaveFxqlStatement(validFxqlText);

      expect(result).toEqual([
        {
          EntryId: 1,
          SourceCurrency: 'USD',
          DestinationCurrency: 'EUR',
          SellPrice: 1.10,
          BuyPrice: 1.05,
          CapAmount: 1000,
        },
      ]);

      expect(mockUtilService.validateCurrencyAndPrices).toHaveBeenCalledWith(
        'USD',
        'EUR',
        1.05,
        1.10,
        1000,
      );

      expect(mockPrismaService.fxqlStatement.upsert).toHaveBeenCalledWith({
        where: {
          sourceCurrency_destinationCurrency: {
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
          },
        },
        update: {
          buyPrice: 1.05,
          sellPrice: 1.10,
          capAmount: 1000,
        },
        create: {
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyPrice: 1.05,
          sellPrice: 1.10,
          capAmount: 1000,
        },
      });
    });

    it('should handle multiple valid statements', async () => {
      const multipleFxql = `
        USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }

        EUR-GBP { BUY 0.85 SELL 0.90 CAP 2000 }
      `;

      await service.parseAndSaveFxqlStatement(multipleFxql);

      expect(mockPrismaService.fxqlStatement.upsert).toHaveBeenCalledTimes(2);
    });

    it('should throw error when maximum statements exceeded', async () => {
      const tooManyStatements = Array(1001)
        .fill(validFxqlText)
        .join('\n\n');

      await expect(
        service.parseAndSaveFxqlStatement(tooManyStatements),
      ).rejects.toThrow('Maximum 1000 currency pairs allowed');
    });

    it('should throw error for invalid statement format', async () => {
      const invalidFxql = 'INVALID-FORMAT';

      await expect(
        service.parseAndSaveFxqlStatement(invalidFxql),
      ).rejects.toThrow('Invalid FXQL statement format');
    });

    it('should throw error when validation fails', async () => {
      mockUtilService.validateCurrencyAndPrices.mockImplementation(() => {
        throw new Error('Validation error');
      });

      await expect(
        service.parseAndSaveFxqlStatement(validFxqlText),
      ).rejects.toThrow('Validation error');
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.fxqlStatement.upsert.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.parseAndSaveFxqlStatement(validFxqlText),
      ).rejects.toThrow('FXQL parsing failed');
    });
  });

  describe('private methods', () => {
    describe('parseStatement', () => {
      it('should correctly parse valid statement', () => {
        const statement = 'USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }';
        const result = (service as any).parseStatement(statement);

        expect(result).toEqual({
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyPrice: 1.05,
          sellPrice: 1.10,
          capAmount: 1000,
        });
      });

      it('should throw error for invalid statement format', () => {
        const invalidStatement = 'INVALID-FORMAT';
        expect(() =>
          (service as any).parseStatement(invalidStatement),
        ).toThrow();
      });
    });

    describe('extractStatements', () => {
      it('should correctly split multiple statements', () => {
        const input = `
          USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }

          EUR-GBP { BUY 0.85 SELL 0.90 CAP 2000 }
        `;

        const result = (service as any).extractStatements(input);
        expect(result).toHaveLength(2);
      });

      it('should filter out empty statements', () => {
        const input = `
          USD-EUR { BUY 1.05 SELL 1.10 CAP 1000 }

          

          EUR-GBP { BUY 0.85 SELL 0.90 CAP 2000 }
        `;

        const result = (service as any).extractStatements(input);
        expect(result).toHaveLength(2);
      });
    });

    describe('formatFxqlRates', () => {
      it('should correctly format rates', () => {
        const input = [
          {
            id: 1,
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 1.05,
            sellPrice: 1.10,
            capAmount: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const result = service.formatFxqlRates(input);
        expect(result).toEqual([
          {
            EntryId: 1,
            SourceCurrency: 'USD',
            DestinationCurrency: 'EUR',
            SellPrice: 1.10,
            BuyPrice: 1.05,
            CapAmount: 1000,
          },
        ]);
      });
    });
  });
});