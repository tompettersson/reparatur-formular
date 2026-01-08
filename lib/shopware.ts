/**
 * Shopware 6 API Client - READ ONLY!
 *
 * ⚠️ KRITISCH: Dies verbindet mit dem PRODUCTION Shop von kletterschuhe.de
 *
 * ERLAUBT: Nur GET/Search Operationen für Produktvorschläge
 * VERBOTEN: Jegliche POST/PUT/PATCH/DELETE die Daten verändern
 */

const SHOPWARE_API_URL = process.env.SHOPWARE_API_URL || 'https://www.kletterschuhe.de/api';
const SHOPWARE_ACCESS_KEY_ID = process.env.SHOPWARE_ACCESS_KEY_ID;
const SHOPWARE_SECRET_ACCESS_KEY = process.env.SHOPWARE_SECRET_ACCESS_KEY;

export interface ShopwareProduct {
  id: string;
  name: string;
  productNumber: string;
  description: string | null;
  price: number;
  url: string;
  imageUrl: string | null;
  manufacturer: string | null;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  price: string;
  url: string;
  imageUrl: string | null;
  manufacturer: string | null;
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth2 access token (cached for 600s)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  if (!SHOPWARE_ACCESS_KEY_ID || !SHOPWARE_SECRET_ACCESS_KEY) {
    throw new Error('Shopware API credentials not configured');
  }

  const response = await fetch(`${SHOPWARE_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: SHOPWARE_ACCESS_KEY_ID,
      client_secret: SHOPWARE_SECRET_ACCESS_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopware auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  return cachedToken;
}

/**
 * Search products by manufacturer and query - READ ONLY
 *
 * @param manufacturer - Brand name (e.g., "La Sportiva")
 * @param query - Search term (e.g., "Solution")
 * @returns Array of matching products (max 5)
 */
export async function searchProducts(
  manufacturer: string,
  query: string
): Promise<ProductSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const token = await getAccessToken();

    // Build search filters
    const filters: any[] = [];

    // Filter by product name containing query
    filters.push({
      type: 'contains',
      field: 'name',
      value: query,
    });

    // Search request - READ ONLY (POST to /search is just for query, not data modification)
    const response = await fetch(`${SHOPWARE_API_URL}/search/product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 10,
        filter: filters,
        associations: {
          manufacturer: {},
          cover: {
            associations: {
              media: {},
            },
          },
        },
        includes: {
          product: ['id', 'name', 'productNumber', 'price', 'seoUrls', 'cover', 'manufacturer'],
          product_manufacturer: ['name'],
          product_media: ['media'],
          media: ['url'],
        },
      }),
    });

    if (!response.ok) {
      console.error('Shopware search failed:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    // Map results and filter by manufacturer if specified
    const suggestions: ProductSuggestion[] = [];

    for (const item of data.data) {
      const attrs = item.attributes || item;

      // Get manufacturer name from included data
      let manufacturerName: string | null = null;
      if (item.relationships?.manufacturer?.data?.id && data.included) {
        const mfg = data.included.find(
          (inc: any) => inc.type === 'product_manufacturer' && inc.id === item.relationships.manufacturer.data.id
        );
        manufacturerName = mfg?.attributes?.name || null;
      }

      // Filter by manufacturer if specified
      if (manufacturer && manufacturerName) {
        const normalizedMfg = manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedShopMfg = manufacturerName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!normalizedShopMfg.includes(normalizedMfg) && !normalizedMfg.includes(normalizedShopMfg)) {
          continue;
        }
      }

      // Get price
      let price = '0,00 €';
      if (attrs.price && Array.isArray(attrs.price) && attrs.price[0]) {
        const grossPrice = attrs.price[0].gross || attrs.price[0].net || 0;
        price = new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(grossPrice);
      }

      // Get image URL from cover
      let imageUrl: string | null = null;
      if (item.relationships?.cover?.data?.id && data.included) {
        const coverMedia = data.included.find(
          (inc: any) => inc.type === 'product_media' && inc.id === item.relationships.cover.data.id
        );
        if (coverMedia?.relationships?.media?.data?.id) {
          const media = data.included.find(
            (inc: any) => inc.type === 'media' && inc.id === coverMedia.relationships.media.data.id
          );
          imageUrl = media?.attributes?.url || null;
        }
      }

      // Build product URL
      const productUrl = `https://www.kletterschuhe.de/detail/${item.id}`;

      suggestions.push({
        id: item.id,
        name: attrs.name || 'Unbekanntes Produkt',
        price,
        url: productUrl,
        imageUrl,
        manufacturer: manufacturerName,
      });

      // Limit to 5 results
      if (suggestions.length >= 5) {
        break;
      }
    }

    return suggestions;
  } catch (error) {
    console.error('Shopware API error:', error);
    return [];
  }
}
