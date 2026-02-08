import { useState, useEffect } from 'react';
import { getGuitar } from '../lib/supabase/guitars';
import { adaptGuitar } from '../lib/supabase/adapters';
import { getGuitarById, guitars as MOCK_GUITARS } from '../data/guitars';

/**
 * Check if Supabase is configured (env vars are set to real values).
 */
function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes('YOUR_PROJECT_ID');
}

/**
 * Hook for fetching a single guitar by ID.
 * Falls back to local mock data when Supabase isn't configured.
 */
export function useGuitar(id) {
  const [guitar, setGuitar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (!id) {
      // No ID — use first mock guitar as fallback
      setGuitar(MOCK_GUITARS[0]);
      setUsingMockData(true);
      setLoading(false);
      return;
    }

    async function fetchGuitar() {
      setLoading(true);
      setError(null);

      // If Supabase isn't configured, use mock data
      if (!isSupabaseConfigured()) {
        setUsingMockData(true);
        const mock = getGuitarById(id) || MOCK_GUITARS[0];
        setGuitar(mock);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      try {
        setUsingMockData(false);
        const data = await getGuitar(id);
        setGuitar(adaptGuitar(data));
      } catch (err) {
        console.error('Error fetching guitar:', err);
        setError(err.message);
        // Fallback to mock data on error
        setUsingMockData(true);
        const mock = getGuitarById(id) || MOCK_GUITARS[0];
        setGuitar(mock);
      } finally {
        setLoading(false);
      }
    }

    fetchGuitar();
  }, [id]);

  return { guitar, loading, error, usingMockData };
}
