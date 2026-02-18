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

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
      const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
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
      });

      if (!response.ok) {
        console.warn(`[DataForSEO] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json() as Record<string, unknown>;

      const results: ShoppingResult[] = [];
      const tasks = data?.tasks as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
      }

      const task = tasks[0] as Record<string, unknown>;
      if (task.status_code !== 20000 || !task.result) {
        console.warn(`[DataForSEO] Task status ${task.status_code}: ${task.status_message}`);
        return [];
      }

      for (const resultSet of task.result as Array<Record<string, unknown>>) {
        const serpItems = resultSet.items;
        if (!Array.isArray(serpItems)) continue;

        for (const serpItem of serpItems as Array<Record<string, unknown>>) {
          // Extract products from popular_products blocks
          if (serpItem.type === 'popular_products') {
            const products = serpItem.items;
            if (!Array.isArray(products)) continue;
            for (const product of products as Array<Record<string, unknown>>) {
              const priceObj = product.price as Record<string, unknown> | undefined;
              const current = priceObj?.current;
              if (current == null) continue;
              const priceNum = typeof current === 'number' ? current : parseFloat(String(current)) || 0;
              if (priceNum <= 0) continue;
              results.push({
                title: (product.title as string) ?? '',
                price: priceNum,
                currency: (priceObj?.currency as string) ?? 'CAD',
                seller: (product.seller as string) ?? '',
                url: (product.url as string) ?? '',
              });
            }
          }
        }
      }

      this.cache.set(normalizedQuery, {
        results,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

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
