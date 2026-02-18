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

function shoppingBlock(items: unknown[]) {
  return { type: 'shopping', items };
}

function shoppingItem(title: string, price: number, currency = 'CAD', source = '', url = '') {
  return { title, price: { current: price, currency }, source, url };
}

function paidShoppingAd(title: string, price: number, currency = 'CAD', source = '', shoppingUrl = '') {
  return {
    type: 'paid',
    title,
    price: { current: price, currency },
    source,
    shopping_url: shoppingUrl,
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

    // May be called once (success) or twice (if first call triggers retry logic on signal)
    expect(fetchSpy).toHaveBeenCalled();
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

  it('parses shopping block results correctly', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      shoppingBlock([
        shoppingItem('Laptop A', 899.99, 'CAD', 'BestBuy.ca', 'https://bestbuy.ca/laptop'),
        shoppingItem('Laptop B', 1099.99, 'USD', 'Amazon.com', 'https://amazon.com/laptop'),
      ]),
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('laptop');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      title: 'Laptop A',
      price: 899.99,
      currency: 'CAD',
      seller: 'BestBuy.ca',
      url: 'https://bestbuy.ca/laptop',
    });
    expect(results[1]).toEqual({
      title: 'Laptop B',
      price: 1099.99,
      currency: 'USD',
      seller: 'Amazon.com',
      url: 'https://amazon.com/laptop',
    });
  });

  it('parses paid shopping ads with shopping_url', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      paidShoppingAd('Keyboard X', 79.99, 'CAD', 'Newegg.ca', 'https://newegg.ca/keyboard'),
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('keyboard');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      title: 'Keyboard X',
      price: 79.99,
      currency: 'CAD',
      seller: 'Newegg.ca',
      url: 'https://newegg.ca/keyboard',
    });
  });

  it('ignores paid results without shopping_url', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      { type: 'paid', title: 'Ad without shopping', price: { current: 50, currency: 'CAD' } },
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('ad test');

    expect(results).toHaveLength(0);
  });

  it('extracts from multiple SERP types in same response', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [
      popularProducts([product('Pop Item', 25, 'CAD', 'S1')]),
      shoppingBlock([shoppingItem('Shop Item', 30, 'CAD', 'S2')]),
      paidShoppingAd('Ad Item', 35, 'CAD', 'S3', 'https://example.com'),
      { type: 'organic', title: 'Organic result' },
    ];

    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('mixed');

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title)).toEqual(['Pop Item', 'Shop Item', 'Ad Item']);
  });

  it('ignores non-shopping SERP items and products without price', async () => {
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

  it('uses short TTL for empty results', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    // First call returns empty results
    fetchSpy.mockResolvedValue(createMockResponse(buildApiResponse([])));

    const { dataForSeoService } = await import('./dataforseo.service');

    await dataForSeoService.search('empty test');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Immediately after, cache should still be valid
    await dataForSeoService.search('empty test');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance time past empty TTL (5 minutes)
    vi.useFakeTimers();
    vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

    // Now it should re-fetch
    await dataForSeoService.search('empty test');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('retries once on fetch failure', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [popularProducts([product('Retry Success', 50, 'CAD', 'S')])];

    // First call fails, second succeeds
    fetchSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('retry test');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Retry Success');
  });

  it('retries once on non-OK HTTP response', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    const serpItems = [popularProducts([product('After 500', 75, 'CAD', 'S')])];

    // First call returns 500, second succeeds
    fetchSpy
      .mockResolvedValueOnce(createMockResponse({}, false, 500))
      .mockResolvedValueOnce(createMockResponse(buildApiResponse(serpItems)));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('http retry test');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('After 500');
  });

  it('returns empty when both retries fail', async () => {
    process.env.DATAFORSEO_LOGIN = 'user@test.com';
    process.env.DATAFORSEO_PASSWORD = 'secret123';

    fetchSpy
      .mockRejectedValueOnce(new Error('Network error 1'))
      .mockRejectedValueOnce(new Error('Network error 2'));

    const { dataForSeoService } = await import('./dataforseo.service');
    const results = await dataForSeoService.search('double fail');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(results).toEqual([]);
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
