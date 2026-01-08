'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchShopwareProducts } from '@/app/order/new/actions';
import type { ProductSuggestion } from '@/lib/shopware';

interface ProductSuggestionsProps {
  manufacturer: string;
  modelQuery: string;
}

export function ProductSuggestions({ manufacturer, modelQuery }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  const searchProducts = useCallback(async (mfg: string, query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchShopwareProducts(mfg, query);
      setSuggestions(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(manufacturer, modelQuery);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [manufacturer, modelQuery, searchProducts]);

  // Handle product click - open in new tab
  const handleProductClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Don't render if no query or no results after search
  if (!modelQuery || modelQuery.length < 2) {
    return null;
  }

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-[#3ca1ac]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span className="text-sm font-medium text-[#78716c]">
          Alternativ neu kaufen?
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-[#a8a29e] py-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Suche in kletterschuhe.de...</span>
        </div>
      )}

      {/* No results */}
      {!isLoading && hasSearched && suggestions.length === 0 && (
        <p className="text-sm text-[#a8a29e] py-2">
          Keine passenden Produkte im Shop gefunden.
        </p>
      )}

      {/* Product cards */}
      {!isLoading && suggestions.length > 0 && (
        <div className="grid gap-2">
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductClick(product.url)}
              className="
                flex items-center gap-3 p-3
                bg-[#fafaf9] hover:bg-[#f5f5f4]
                border border-[#e7e5e4] hover:border-[#3ca1ac]
                rounded-lg
                transition-all duration-200
                text-left
                group
              "
            >
              {/* Product image */}
              <div className="w-12 h-12 flex-shrink-0 rounded-md bg-white border border-[#e7e5e4] overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#d6d3d1]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#38362d] truncate group-hover:text-[#3ca1ac]">
                  {product.name}
                </p>
                {product.manufacturer && (
                  <p className="text-xs text-[#a8a29e]">{product.manufacturer}</p>
                )}
              </div>

              {/* Price and action */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-[#ef6a27]">{product.price}</p>
                <span className="text-xs text-[#3ca1ac] group-hover:underline flex items-center gap-1">
                  Im Shop
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductSuggestions;
