import { useEffect, useState } from 'react';
import { getAllSuggestions, seedSuggestionsIfNeeded } from '@/lib/firebase/suggestions';

function filterSuggestions(options: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return options
    .filter((o) => o.toLowerCase().includes(q) && o.toLowerCase() !== q)
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    })
    .slice(0, 2);
}

export function useFieldSuggestions(
  userId: string | undefined,
  brandQuery: string,
  storeQuery: string,
  descriptionQuery: string
) {
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allStores, setAllStores] = useState<string[]>([]);
  const [allDescriptions, setAllDescriptions] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    seedSuggestionsIfNeeded(userId).then(() =>
      Promise.all([
        getAllSuggestions(userId, 'brands'),
        getAllSuggestions(userId, 'stores'),
        getAllSuggestions(userId, 'descriptions'),
      ]).then(([brands, stores, descriptions]) => {
        setAllBrands(brands);
        setAllStores(stores);
        setAllDescriptions(descriptions);
      })
    );
  }, [userId]);

  return {
    brandSuggestions: filterSuggestions(allBrands, brandQuery),
    storeSuggestions: filterSuggestions(allStores, storeQuery),
    descriptionSuggestions: filterSuggestions(allDescriptions, descriptionQuery),
  };
}
