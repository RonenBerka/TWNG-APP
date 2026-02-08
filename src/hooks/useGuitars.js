import { useState, useEffect, useCallback } from 'react';
import { getGuitars } from '../lib/supabase/guitars';
import { adaptGuitars } from '../lib/supabase/adapters';
import { guitars as MOCK_GUITARS } from '../data/guitars';

/**
 * Check if Supabase is configured (env vars are set to real values).
 */
function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes('YOUR_PROJECT_ID');
}

/**
 * Hook for fetching guitars with filters, sorting, and pagination.
 * Falls back to local mock data when Supabase isn't configured.
 */
export function useGuitars({
  page = 1,
  perPage = 20,
  brand,
  instrumentType,
  bodyStyle,
  yearMin,
  yearMax,
  search,
  sortBy = 'created_at',
  sortOrder = 'desc',
} = {}) {
  const [guitars, setGuitars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchGuitars = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If Supabase isn't configured, use mock data
    if (!isSupabaseConfigured()) {
      setUsingMockData(true);

      // Apply filters to mock data client-side
      let filtered = [...MOCK_GUITARS];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (g) =>
            g.brand.toLowerCase().includes(q) ||
            g.model.toLowerCase().includes(q) ||
            String(g.year).includes(q)
        );
      }
      if (brand) {
        filtered = filtered.filter((g) =>
          g.brand.toLowerCase().includes(brand.toLowerCase())
        );
      }
      if (bodyStyle) {
        filtered = filtered.filter((g) => g.bodyType === bodyStyle);
      }
      if (yearMin) {
        filtered = filtered.filter((g) => g.year >= yearMin);
      }
      if (yearMax) {
        filtered = filtered.filter((g) => g.year <= yearMax);
      }

      // Sort
      if (sortOrder === 'asc') {
        filtered.sort((a, b) => a.year - b.year);
      } else {
        filtered.sort((a, b) => b.year - a.year);
      }

      // Paginate
      const start = (page - 1) * perPage;
      const paged = filtered.slice(start, start + perPage);

      setGuitars(paged);
      setTotal(filtered.length);
      setLoading(false);
      return;
    }

    // Real Supabase fetch
    try {
      setUsingMockData(false);
      const result = await getGuitars({
        page,
        perPage,
        brand,
        instrumentType,
        bodyStyle,
        yearMin,
        yearMax,
        search,
        sortBy,
        sortOrder,
      });

      setGuitars(adaptGuitars(result.guitars));
      setTotal(result.total);
    } catch (err) {
      console.error('Error fetching guitars:', err);
      setError(err.message);

      // Fallback to mock data on error
      setUsingMockData(true);
      setGuitars(MOCK_GUITARS);
      setTotal(MOCK_GUITARS.length);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, brand, instrumentType, bodyStyle, yearMin, yearMax, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchGuitars();
  }, [fetchGuitars]);

  return {
    guitars,
    total,
    loading,
    error,
    usingMockData,
    refetch: fetchGuitars,
  };
}
