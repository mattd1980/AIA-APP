import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildSearchQuery,
  computeMedian,
  filterOutliers,
} from './pricing.service';
import type { PricingInput } from './pricing.service';

// Mock the dataforseo service before importing pricingService
vi.mock('./dataforseo.service', () => {
  const mockSearch = vi.fn();
  return {
    dataForSeoService: {
      isConfigured: true,
      search: mockSearch,
    },
  };
});

// Import after mock setup
import { pricingService } from './pricing.service';
import { dataForSeoService } from './dataforseo.service';

const mockSearch = dataForSeoService.search as ReturnType<typeof vi.fn>;

describe('buildSearchQuery', () => {
  it('translates French name to English keywords with buy prefix', () => {
    expect(buildSearchQuery({ itemName: 'Canape en cuir marron' })).toBe('buy sofa leather brown');
  });

  it('combines translated name with brand and model', () => {
    const input: PricingInput = {
      itemName: 'Canape en cuir marron',
      brand: 'IKEA',
      model: 'KIVIK',
    };
    expect(buildSearchQuery(input)).toBe('buy sofa leather brown IKEA KIVIK');
  });

  it('preserves unknown words (brands/models) in item name', () => {
    expect(buildSearchQuery({ itemName: 'Televiseur Samsung' })).toBe('buy television samsung');
  });

  it('returns empty string when name is empty', () => {
    expect(buildSearchQuery({ itemName: '' })).toBe('');
  });

  it('appends translated category when provided', () => {
    const input: PricingInput = {
      itemName: 'Televiseur Samsung',
      category: 'Electronique',
    };
    expect(buildSearchQuery(input)).toBe('buy television samsung electronics');
  });

  it('appends category even without brand/model', () => {
    const input: PricingInput = {
      itemName: 'Lampe',
      category: 'Eclairage',
    };
    expect(buildSearchQuery(input)).toBe('buy lamp lighting');
  });
});

describe('computeMedian', () => {
  it('returns middle value for odd count', () => {
    expect(computeMedian([3, 1, 2])).toBe(2);
  });

  it('returns average of two middle values for even count', () => {
    expect(computeMedian([4, 1, 3, 2])).toBe(2.5);
  });

  it('returns the value itself for single element', () => {
    expect(computeMedian([42])).toBe(42);
  });

  it('returns 0 for empty array', () => {
    expect(computeMedian([])).toBe(0);
  });
});

describe('filterOutliers', () => {
  it('removes prices outside 50%-200% of median', () => {
    // Median of [10, 100, 105, 110, 500] = 105
    // 50% of 105 = 52.5, 200% of 105 = 210
    // 10 and 500 are outliers
    const result = filterOutliers([10, 100, 105, 110, 500]);
    expect(result).toEqual([100, 105, 110]);
  });

  it('passes through arrays with fewer than 3 items', () => {
    expect(filterOutliers([10, 500])).toEqual([10, 500]);
    expect(filterOutliers([42])).toEqual([42]);
  });

  it('returns original array if all values would be filtered', () => {
    // All zeros => median 0 => skip filtering
    expect(filterOutliers([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe('pricingService.estimatePrice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeros when DataForSEO is not configured', async () => {
    const originalValue = dataForSeoService.isConfigured;
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: false, writable: true });

    const result = await pricingService.estimatePrice({ itemName: 'Laptop' });

    expect(result.estimatedValue).toBe(0);
    expect(result.replacementValue).toBe(0);
    expect(result.pricingMetadata).toBeNull();

    Object.defineProperty(dataForSeoService, 'isConfigured', { value: originalValue, writable: true });
  });

  it('returns zeros when no CAD or USD results found', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'Item', price: 50, currency: 'EUR', seller: 'Amazon', url: '' },
    ]);

    const result = await pricingService.estimatePrice({ itemName: 'Laptop' });

    expect(result.estimatedValue).toBe(0);
    expect(result.replacementValue).toBe(0);
    expect(result.pricingMetadata).not.toBeNull();
    expect(result.pricingMetadata!.sampleCount).toBe(0);
  });

  it('computes correct median and replacement for valid CAD data', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'A', price: 100, currency: 'CAD', seller: 'S1', url: '' },
      { title: 'B', price: 200, currency: 'CAD', seller: 'S2', url: '' },
      { title: 'C', price: 150, currency: 'CAD', seller: 'S3', url: '' },
    ]);

    const result = await pricingService.estimatePrice({ itemName: 'Widget' });

    // Median of [100, 150, 200] = 150
    expect(result.estimatedValue).toBe(150);
    // Replacement = 150 * 1.3 = 195
    expect(result.replacementValue).toBe(195);
    expect(result.pricingMetadata!.medianPrice).toBe(150);
    expect(result.pricingMetadata!.sampleCount).toBe(3);
    expect(result.pricingMetadata!.pricingSource).toBe('dataforseo');
  });

  it('falls back to USD when fewer than 2 CAD results', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'CAD Item', price: 100, currency: 'CAD', seller: 'S1', url: '' },
      { title: 'USD Item', price: 50, currency: 'USD', seller: 'S2', url: '' },
    ]);

    const result = await pricingService.estimatePrice({ itemName: 'Widget' });

    // CAD: 100, USD: 50 * 1.38 = 69
    // Median of [69, 100] = 84.5
    expect(result.estimatedValue).toBe(84.5);
    expect(result.pricingMetadata!.sampleCount).toBe(2);
  });

  it('uses only CAD when 2+ CAD results exist (ignores USD)', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'A', price: 100, currency: 'CAD', seller: 'S1', url: '' },
      { title: 'B', price: 200, currency: 'CAD', seller: 'S2', url: '' },
      { title: 'C', price: 80, currency: 'USD', seller: 'S3', url: '' },
    ]);

    const result = await pricingService.estimatePrice({ itemName: 'Widget' });

    // Only CAD: [100, 200], median = 150
    expect(result.estimatedValue).toBe(150);
    expect(result.pricingMetadata!.sampleCount).toBe(2);
  });

  it('uses USD-only results when no CAD available', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'USD A', price: 100, currency: 'USD', seller: 'S1', url: '' },
      { title: 'USD B', price: 200, currency: 'USD', seller: 'S2', url: '' },
    ]);

    const result = await pricingService.estimatePrice({ itemName: 'Widget' });

    // USD: 100*1.38=138, 200*1.38=276 → median=207
    expect(result.estimatedValue).toBe(207);
    expect(result.pricingMetadata!.sampleCount).toBe(2);
  });

  it('includes buy prefix in search query', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([]);

    await pricingService.estimatePrice({ itemName: 'Laptop' });

    expect(mockSearch).toHaveBeenCalledWith('buy laptop');
  });

  it('includes category in search query', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([]);

    await pricingService.estimatePrice({ itemName: 'Laptop', category: 'Informatique' });

    expect(mockSearch).toHaveBeenCalledWith('buy laptop computer');
  });
});

describe('pricingService.estimatePrices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
  });

  it('returns correct number of results for batch input', async () => {
    mockSearch.mockResolvedValue([
      { title: 'A', price: 50, currency: 'CAD', seller: 'S', url: '' },
    ]);

    const items: PricingInput[] = [
      { itemName: 'Item 1' },
      { itemName: 'Item 2' },
      { itemName: 'Item 3' },
    ];

    const results = await pricingService.estimatePrices(items);

    expect(results).toHaveLength(3);
    expect(mockSearch).toHaveBeenCalledTimes(3);
  });
});
