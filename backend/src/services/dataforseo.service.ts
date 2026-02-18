export interface ShoppingResult {
  title: string;
  price: number;
  currency: string;
  seller: string;
  url: string;
}

interface CacheEntry {
  results: ShoppingResult[];
  expiresAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for non-empty results
const EMPTY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for empty results
const FETCH_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 1_000;
const MAX_CACHE_ENTRIES = 500;
const EVICT_COUNT = 100;

class DataForSeoService {
  private cache = new Map<string, CacheEntry>();
  private login: string | undefined;
  private password: string | undefined;

  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD;
  }

  get isConfigured(): boolean {
    return Boolean(this.login && this.password);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private evictOldestEntries(): void {
    if (this.cache.size <= MAX_CACHE_ENTRIES) return;

    const entries = [...this.cache.entries()]
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt);

    for (let i = 0; i < EVICT_COUNT && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private extractPrice(priceObj: Record<string, unknown> | undefined | null): number {
    if (!priceObj) return 0;
    const current = priceObj.current;
    if (current == null) return 0;
    const priceNum = typeof current === 'number' ? current : parseFloat(String(current)) || 0;
    return priceNum > 0 ? priceNum : 0;
  }

  private extractResults(serpItems: Array<Record<string, unknown>>): ShoppingResult[] {
    const results: ShoppingResult[] = [];

    for (const serpItem of serpItems) {
      // popular_products — carousel of product cards
      if (serpItem.type === 'popular_products') {
        const products = serpItem.items;
        if (!Array.isArray(products)) continue;
        for (const product of products as Array<Record<string, unknown>>) {
          const priceObj = product.price as Record<string, unknown> | undefined;
          const price = this.extractPrice(priceObj);
          if (price <= 0) continue;
          results.push({
            title: (product.title as string) ?? '',
            price,
            currency: (priceObj?.currency as string) ?? 'CAD',
            seller: (product.seller as string) ?? '',
            url: (product.url as string) ?? '',
          });
        }
      }

      // shopping — Google Shopping carousel
      if (serpItem.type === 'shopping') {
        const items = serpItem.items;
        if (!Array.isArray(items)) continue;
        for (const item of items as Array<Record<string, unknown>>) {
          const priceObj = item.price as Record<string, unknown> | undefined;
          const price = this.extractPrice(priceObj);
          if (price <= 0) continue;
          results.push({
            title: (item.title as string) ?? '',
            price,
            currency: (priceObj?.currency as string) ?? 'CAD',
            seller: (item.source as string) ?? '',
            url: (item.url as string) ?? '',
          });
        }
      }

      // paid results with shopping_url — shopping ads
      if (serpItem.type === 'paid' && serpItem.shopping_url) {
        const priceObj = serpItem.price as Record<string, unknown> | undefined;
        const price = this.extractPrice(priceObj);
        if (price <= 0) continue;
        results.push({
          title: (serpItem.title as string) ?? '',
          price,
          currency: (priceObj?.currency as string) ?? 'CAD',
          seller: (serpItem.source as string) ?? '',
          url: (serpItem.shopping_url as string) ?? '',
        });
      }
    }

    return results;
  }

  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (attempt === 0) {
            console.warn(`[DataForSEO] HTTP ${response.status}, retrying...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            continue;
          }
          console.warn(`[DataForSEO] HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (err) {
        if (attempt === 0) {
          console.warn(`[DataForSEO] Request failed, retrying: ${(err as Error).message}`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        throw err;
      }
    }

    // Unreachable — loop always returns or throws on attempt 1
    throw new Error('[DataForSEO] Unreachable');
  }

  async search(query: string): Promise<ShoppingResult[]> {
    if (!this.isConfigured) {
      return [];
    }

    const normalizedQuery = this.normalizeQuery(query);
    const cached = this.cache.get(normalizedQuery);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.results;
    }

    try {
      const credentials = Buffer.from(`${this.login}:${this.password}`).toString('base64');
      const response = await this.fetchWithRetry(
        'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keyword: query,
              location_code: 2124, // Canada
              language_code: 'en',
              device: 'desktop',
              os: 'windows',
            },
          ]),
        },
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as Record<string, unknown>;

      const tasks = data?.tasks as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
      }

      const task = tasks[0] as Record<string, unknown>;
      if (task.status_code !== 20000 || !task.result) {
        console.warn(`[DataForSEO] Task status ${task.status_code}: ${task.status_message}`);
        return [];
      }

      const results: ShoppingResult[] = [];
      for (const resultSet of task.result as Array<Record<string, unknown>>) {
        const serpItems = resultSet.items;
        if (!Array.isArray(serpItems)) continue;
        results.push(...this.extractResults(serpItems as Array<Record<string, unknown>>));
      }

      const ttl = results.length > 0 ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS;
      this.cache.set(normalizedQuery, {
        results,
        expiresAt: Date.now() + ttl,
      });

      this.evictOldestEntries();

      return results;
    } catch (err) {
      console.warn('[DataForSEO] Request failed:', (err as Error).message);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const dataForSeoService = new DataForSeoService();
