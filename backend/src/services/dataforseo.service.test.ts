import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to control env vars before the module loads
const originalEnv = { ...process.env };

function createMockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

function buildApiResponse(serpItems: unknown[]) {
  return {
    tasks: [
      {
        status_code: 20000,
        status_message: 'Ok.',
        result: [{ items: serpItems }],
      },
    ],
  };
}

function popularProducts(products: unknown[]) {
  return { type: 'popular_products', items: products };
}

function product(title: string, price: number, currency = 'CAD', seller = '', url = '') {
  return {
    type: 'popular_products_element',
    title,
    price: { current: price, currency },
    seller,
    url,
  };
}

describe('DataForSeoService', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it('returns empty array when credentials are not set', async () => {
    delete process.env.DATAFORSEO_LOGIN;
    delete process.env.DATAFORSEO_PASSWORD;

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('test query');

    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends correct HTTP request with Basic Auth and location_code 2124', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse([])));

    const { dataForSeoService } = await import('./dataforseo.service');
    await dataForSeoService.search('test query');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.dataforseo.com/v3/serp/google/organic/live/advanced');
    expect(options.method).toBe('POST');

    const expectedAuth = Buffer.from('user@test.com:secret123').toString('base64');
    expect(options.headers.Authorization).toBe(`Basic ${expectedAuth}`);

    const body = JSON.parse(options.body);
    expect(body[0].location_code).toBe(2124);
    expect(body[0].keyword).toBe('test query');
  });

  it('parses popular_products results correctly', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      popularProducts([
        product('Widget Pro', 49.99, 'CAD', 'Amazon.ca', 'https://amazon.ca/widget'),
        product('Widget Basic', 29.99, 'CAD', 'BestBuy.ca', 'https://bestbuy.ca/widget'),
      ]),
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('widget');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      title: 'Widget Pro',
      price: 49.99,
      currency: 'CAD',
      seller: 'Amazon.ca',
      url: 'https://amazon.ca/widget',
    });
    expect(results[1].seller).toBe('BestBuy.ca');
  });

  it('ignores non-popular_products SERP items and products without price', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      { type: 'organic', title: 'Organic result' },
      { type: 'people_also_ask' },
      popularProducts([
        product('Real', 10, 'CAD', 'S'),
        { type: 'popular_products_element', title: 'No price', price: null },
        { type: 'popular_products_element', title: 'Zero price', price: { current: 0, currency: 'CAD' } },
      ]),
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('mixed results');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Real');
  });

  it('returns cached results on second call without re-fetching', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [popularProducts([product('Cached', 25, 'CAD', 'S')])];
    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');

    const first = await dataForSeoService.search('cache test');
    const second = await dataForSeoService.search('cache test');

    expect(first).toEqual(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('clearCache forces a re-fetch on next call', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [popularProducts([product('Fresh', 30, 'CAD', 'S')])];
    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');

    await dataForSeoService.search('clear test');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    dataForSeoService.clearCache();
    await dataForSeoService.search('clear test');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
