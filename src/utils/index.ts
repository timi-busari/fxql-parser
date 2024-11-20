import { Injectable } from '@nestjs/common';
import { CustomException } from './custom-exception';

// define validation rules for corresponding error messages
enum ValidationRule {
  SAME_CURRENCY = 'Source and destination currencies must be different',
  INVALID_BUY_PRICE = 'Invalid buy price: must be a positive number',
  INVALID_SELL_PRICE = 'Invalid sell price: must be a positive number',
  SELL_BELOW_BUY = 'Sell price must be higher than buy price',
  NEGATIVE_CAP = 'Invalid cap amount: must be a non-negative number',
}

@Injectable()
export class FxqlUtilService {
  // validates if a currency code is in the correct format (3 uppercase letters).
  validateCurrency(currency: string): void {
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new CustomException(`Invalid currency: ${currency}`);
    }
  }

  validateCurrencyAndPrices(
    sourceCurrency: string,
    destinationCurrency: string,
    buyPrice: number,
    sellPrice: number,
    capAmount: number,
  ) {
    // list of validation rules with conditions and error messages.
    const validations: Array<[boolean, ValidationRule, any?]> = [
      [sourceCurrency === destinationCurrency, ValidationRule.SAME_CURRENCY],
      [buyPrice <= 0, ValidationRule.INVALID_BUY_PRICE, { buyPrice }],
      [sellPrice <= 0, ValidationRule.INVALID_SELL_PRICE, { sellPrice }],
      [
        sellPrice <= buyPrice,
        ValidationRule.SELL_BELOW_BUY,
        { sellPrice, buyPrice },
      ],
      [capAmount < 0, ValidationRule.NEGATIVE_CAP, { capAmount }],
    ];

    // Iterate over validation rules and throw errors if conditions are met.
    for (const [condition, errorMessage, context] of validations) {
      if (condition) {
        const errorDetails = context
          ? `${errorMessage}: ${JSON.stringify(context)}`
          : errorMessage;
        throw new Error(errorDetails);
      }
    }

    // Additional validations
    this.validateCurrency(sourceCurrency);
    this.validateCurrency(destinationCurrency);
  }
}
