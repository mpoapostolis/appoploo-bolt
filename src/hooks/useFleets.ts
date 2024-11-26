import useSWR from 'swr';
import { getFleets } from '../lib/pocketbase';
import type { Fleet } from '../types/fleet';

export function useFleets() {
  const { data, error, isLoading, mutate } = useSWR<Fleet[]>(
    'trackers',
    getFleets,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    fleets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}