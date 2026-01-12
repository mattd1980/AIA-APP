import { ItemCondition } from '../types';

class CalculationService {
  calculateReplacementValue(
    averagePrice: number,
    condition: ItemCondition,
    estimatedAge: number
  ): number {
    // Condition factors
    const conditionFactors: Record<ItemCondition, number> = {
      new: 1.0,
      excellent: 0.9,
      good: 0.75,
      fair: 0.6,
      poor: 0.4,
    };

    // Annual depreciation (5% per year)
    const annualDepreciation = 0.05;

    let value = averagePrice * conditionFactors[condition];

    // Apply age depreciation
    if (estimatedAge > 0) {
      value = value * Math.pow(1 - annualDepreciation, estimatedAge);
    }

    // Round to 2 decimal places
    return Math.round(value * 100) / 100;
  }
}

export const calculationService = new CalculationService();
