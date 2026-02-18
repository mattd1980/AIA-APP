import { dataForSeoService } from './dataforseo.service';
import type { ShoppingResult } from './dataforseo.service';
import { translateToEnglish } from '../constants/item-translations';

export interface PricingInput {
  itemName: string;
  brand?: string;
  model?: string;
  category?: string;
}

export interface PricingMetadata {
  pricingSource: 'dataforseo' | 'none';
  medianPrice: number;
  sampleCount: number;
  searchQuery: string;
  priceRange: { min: number; max: number };
  estimatedAt: string;
}

export interface PricingResult {
  estimatedValue: number;
  replacementValue: number;
  pricingMetadata: PricingMetadata | null;
}

const REPLACEMENT_BUFFER = parseFloat(process.env.INSURANCE_REPLACEMENT_BUFFER ?? '1.3');
const INTER_REQUEST_DELAY_MS = 200;

export function buildSearchQuery(item: PricingInput): string {
  const parts: string[] = [];
  if (item.itemName) parts.push(translateToEnglish(item.itemName));
  if (item.brand) parts.push(item.brand);
  if (item.model) parts.push(item.model);
  return parts.join(' ');
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function filterOutliers(prices: number[]): number[] {
  if (prices.length < 3) return prices;
  const initialMedian = computeMedian(prices);
  if (initialMedian === 0) return prices;
  const filtered = prices.filter(
    (p) => p >= initialMedian * 0.5 && p <= initialMedian * 2.0
  );
  return filtered.length > 0 ? filtered : prices;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class PricingService {
  async estimatePrice(item: PricingInput): Promise<PricingResult> {
    if (!dataForSeoService.isConfigured) {
      return { estimatedValue: 0, replacementValue: 0, pricingMetadata: null };
    }

    const searchQuery = buildSearchQuery(item);
    if (!searchQuery.trim()) {
      return { estimatedValue: 0, replacementValue: 0, pricingMetadata: null };
    }

    const results = await dataForSeoService.search(searchQuery);

    // Filter to CAD only
    const cadResults = results.filter(
      (r: ShoppingResult) => r.currency === 'CAD' && r.price > 0
    );

    if (cadResults.length === 0) {
      return {
        estimatedValue: 0,
        replacementValue: 0,
        pricingMetadata: {
          pricingSource: 'dataforseo',
          medianPrice: 0,
          sampleCount: 0,
          searchQuery,
          priceRange: { min: 0, max: 0 },
          estimatedAt: new Date().toISOString(),
        },
      };
    }

    const rawPrices = cadResults.map((r: ShoppingResult) => r.price);
    const filteredPrices = filterOutliers(rawPrices);
    const medianPrice = computeMedian(filteredPrices);

    const estimatedValue = Math.round(medianPrice * 100) / 100;
    const replacementValue = Math.round(medianPrice * REPLACEMENT_BUFFER * 100) / 100;

    return {
      estimatedValue,
      replacementValue,
      pricingMetadata: {
        pricingSource: 'dataforseo',
        medianPrice,
        sampleCount: filteredPrices.length,
        searchQuery,
        priceRange: {
          min: Math.min(...filteredPrices),
          max: Math.max(...filteredPrices),
        },
        estimatedAt: new Date().toISOString(),
      },
    };
  }

  async estimatePrices(items: PricingInput[]): Promise<PricingResult[]> {
    const results: PricingResult[] = [];
    for (let i = 0; i < items.length; i++) {
      const result = await this.estimatePrice(items[i]);
      results.push(result);
      if (i < items.length - 1) {
        await sleep(INTER_REQUEST_DELAY_MS);
      }
    }
    return results;
  }
}

export const pricingService = new PricingService();
