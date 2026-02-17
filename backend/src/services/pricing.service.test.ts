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
  it('returns quoted name only when no brand or model', () => {
    expect(buildSearchQuery({ itemName: 'Laptop' })).toBe('"Laptop"');
  });

  it('combines name, brand, and model', () => {
    const input: PricingInput = {
      itemName: 'Laptop',
      brand: 'Dell',
      model: 'XPS 15',
    };
    expect(buildSearchQuery(input)).toBe('"Laptop" "Dell" "XPS 15"');
  });

  it('returns empty string when name is empty', () => {
    expect(buildSearchQuery({ itemName: '' })).toBe('');
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

  it('returns zeros when no CAD results found', async () => {
    Object.defineProperty(dataForSeoService, 'isConfigured', { value: true, writable: true });
    mockSearch.mockResolvedValue([
      { title: 'Item', price: 50, currency: 'USD', seller: 'Amazon', url: '' },
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
