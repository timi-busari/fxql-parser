import { Injectable, Logger } from '@nestjs/common';
import { FxqlStatement, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// import { CustomException } from 'src/utils/custom-exception';
import { CustomException } from '../utils/custom-exception';
import { FxqlUtilService } from '../utils';
import { FxqlEntry } from './dto/fxql.dto';

@Injectable()
export class FxqlService {
  private readonly logger = new Logger(FxqlService.name);

  constructor(
    private prisma: PrismaService,
    private util: FxqlUtilService,
  ) {}

  /**
   * Parses FXQL text, validates each statement, and saves rates to the database.
   * @param fxqlText - The raw FXQL statements.
   * @returns Formatted FXQL entries after processing.
   */
  async parseAndSaveFxqlStatement(fxqlText: string) {
    this.logger.log(
      `Starting FXQL statement parsing: ${fxqlText.substring(0, 100)}...`,
    );

    try {
      // extract and clean individual FXQL statements

      const statements = this.extractStatements(fxqlText);
      const savedRates: FxqlStatement[] = [];

      // process each FXQL statement
      for (const [index, statement] of statements.entries()) {
        try {
          const {
            sourceCurrency,
            destinationCurrency,
            buyPrice,
            sellPrice,
            capAmount,
          } = this.parseStatement(statement);

          // validate currency codes and pricing details
          this.util.validateCurrencyAndPrices(
            sourceCurrency,
            destinationCurrency,
            buyPrice,
            sellPrice,
            capAmount,
          );

          // save the validated rate to the database
          const savedRate = await this.saveRate(
            sourceCurrency,
            destinationCurrency,
            buyPrice,
            sellPrice,
            capAmount,
          );
          savedRates.push(savedRate);

          this.logger.log(
            `Successfully processed statement ${index + 1}: ${sourceCurrency}-${destinationCurrency}`,
          );
        } catch (statementError) {
          this.logger.error(
            `Error processing statement ${index + 1}: ${statementError.message}`,
          );
          throw new Error(
            `Error in statement ${index + 1}: ${statementError.message}`,
          );
        }
      }

      const formattedRates = this.formatFxqlRates(savedRates);
      this.logger.log(
        `Successfully parsed and saved ${formattedRates.length} FXQL statements`,
      );
      return formattedRates;
    } catch (error) {
      this.logger.error(`FXQL parsing failed: ${error.message}`, error.stack);
      throw new CustomException(`FXQL parsing failed: ${error.message}`);
    }
  }

  private async saveRate(
    sourceCurrency: string,
    destinationCurrency: string,
    buyPrice: number,
    sellPrice: number,
    capAmount: number,
  ) {
    try {
      return await this.prisma.fxqlStatement.upsert({
        where: {
          sourceCurrency_destinationCurrency: {
            sourceCurrency,
            destinationCurrency,
          },
        },
        update: {
          buyPrice,
          sellPrice,
          capAmount,
        },
        create: {
          sourceCurrency,
          destinationCurrency,
          buyPrice,
          sellPrice,
          capAmount,
        },
      });
    } catch (dbError) {
      this.logger.error(`Database error saving rate: ${dbError.message}`);
    }
  }

  //  Extracts and cleans FXQL statements from the input text.
  private extractStatements(fxqlText: string): string[] {
    const cleanedText = fxqlText.trim().replace(/\r\n/g, '\n');
    const statements = cleanedText.split(/\n\n/);

    if (statements.length > 1000) {
      this.logger.warn(
        `Attempt to process ${statements.length} statements (max 1000)`,
      );
      throw new Error(
        `Maximum 1000 currency pairs allowed. Received: ${statements.length}`,
      );
    }

    return statements.filter((statement) => statement.trim() !== '');
  }

  // Parses an individual FXQL statement into its components.

  private parseStatement(statement: string) {
    const matches = statement.match(
      /([A-Z]{3})-([A-Z]{3})\s*{\s*BUY\s+([\d.]+)\s*SELL\s+([\d.]+)\s*CAP\s+([\d.]+)\s*}/,
    );

    if (!matches) {
      throw new Error(`Invalid FXQL statement format: ${statement}`);
    }

    return {
      sourceCurrency: matches[1],
      destinationCurrency: matches[2],
      buyPrice: parseFloat(matches[3]),
      sellPrice: parseFloat(matches[4]),
      capAmount: parseInt(matches[5], 10),
    };
  }

  //  Formats the parsed rates for API responses.
  formatFxqlRates(parsedRates): FxqlEntry[] {
    return parsedRates.map((rate: FxqlStatement) => ({
      EntryId: rate.id,
      SourceCurrency: rate.sourceCurrency,
      DestinationCurrency: rate.destinationCurrency,
      SellPrice: rate.sellPrice,
      BuyPrice: rate.buyPrice,
      CapAmount: rate.capAmount,
    }));
  }
}
