interface PriceData {
  source: string;
  searchQuery: string;
  prices: Array<{
    retailer: string;
    price: number;
    currency: string;
    url?: string;
  }>;
  averagePrice: number;
  currency: string;
  retrievedAt: string;
}

class PricingService {
  // Category-based price ranges (in CAD)
  private categoryPriceRanges: Record<string, { min: number; max: number; typical: number }> = {
    furniture: { min: 200, max: 5000, typical: 800 },
    electronics: { min: 50, max: 3000, typical: 400 },
    clothing: { min: 20, max: 500, typical: 80 },
    appliances: { min: 100, max: 2000, typical: 500 },
    decor: { min: 10, max: 500, typical: 50 },
    other: { min: 25, max: 1000, typical: 150 },
  };

  // Keywords that indicate higher value items
  private premiumKeywords = [
    'leather', 'cuir', 'premium', 'luxury', 'designer', 'professional',
    'large', 'grand', 'king', 'queen', '55', '65', '75', 'inch', 'pouces',
    'smart', '4k', 'oled', 'led', 'stainless', 'inox', 'solid', 'massif'
  ];

  // Keywords that indicate lower value items
  private budgetKeywords = [
    'small', 'petit', 'mini', 'basic', 'simple', 'entry', 'starter'
  ];

  private estimatePriceFromName(itemName: string, category: string): number {
    const name = itemName.toLowerCase();
    const range = this.categoryPriceRanges[category] || this.categoryPriceRanges.other;
    
    // Start with typical price for category
    let price = range.typical;
    
    // Check for premium indicators
    const hasPremium = this.premiumKeywords.some(keyword => name.includes(keyword));
    const hasBudget = this.budgetKeywords.some(keyword => name.includes(keyword));
    
    if (hasPremium) {
      price = range.typical * 1.8; // Premium items cost more
    } else if (hasBudget) {
      price = range.typical * 0.6; // Budget items cost less
    }
    
    // Size indicators (for furniture/electronics)
    if (category === 'furniture' || category === 'electronics') {
      if (name.includes('55') || name.includes('65') || name.includes('75')) {
        price *= 1.5; // Large screens cost more
      } else if (name.includes('32') || name.includes('40')) {
        price *= 0.7; // Smaller screens cost less
      }
    }
    
    // Brand premium (if brand is mentioned, add 20%)
    // This will be handled separately when brand is provided
    
    // Ensure price is within category range
    price = Math.max(range.min, Math.min(range.max, price));
    
    return Math.round(price);
  }

  async searchPrice(
    itemName: string, 
    brand?: string, 
    model?: string,
    category?: string
  ): Promise<PriceData> {
    // For MVP, return smart estimated data based on category and item name
    // In Phase 2, integrate with DataForSEO or SERP API
    
    const searchQuery = [brand, model, itemName].filter(Boolean).join(' ');
    const itemCategory = category || 'other';
    
    // Get base price estimate from item name and category
    let estimatedPrice = this.estimatePriceFromName(itemName, itemCategory);
    
    // Apply brand premium (known brands typically cost 10-30% more)
    if (brand) {
      const brandLower = brand.toLowerCase();
      const premiumBrands = ['apple', 'samsung', 'sony', 'lg', 'dyson', 'dyson', 'bosch', 'miele'];
      const midBrands = ['ikea', 'wayfair', 'amazon basics'];
      
      if (premiumBrands.some(pb => brandLower.includes(pb))) {
        estimatedPrice *= 1.3; // Premium brands
      } else if (midBrands.some(mb => brandLower.includes(mb))) {
        estimatedPrice *= 0.9; // Budget brands
      } else {
        estimatedPrice *= 1.1; // Generic brand premium
      }
    }
    
    // Add some realistic variation (±15%)
    const variation = 0.15;
    const minPrice = estimatedPrice * (1 - variation);
    const maxPrice = estimatedPrice * (1 + variation);
    const finalPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice);
    
    // Round to nearest 10 for more realistic prices
    const roundedPrice = Math.round(finalPrice / 10) * 10;

    return {
      source: 'estimated',
      searchQuery,
      prices: [
        {
          retailer: 'Estimated Price',
          price: roundedPrice,
          currency: 'CAD',
        },
      ],
      averagePrice: roundedPrice,
      currency: 'CAD',
      retrievedAt: new Date().toISOString(),
    };
  }
}

export const pricingService = new PricingService();
