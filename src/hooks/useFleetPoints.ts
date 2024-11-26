import { useEffect } from 'react';
import useSWR from 'swr';
import { pb } from '../lib/pocketbase';
import type { Point } from '../types/fleet';

export function useFleetPoints(trackerId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Point[]>(
    trackerId ? `points-${trackerId}` : null,
    async () => {
      if (!trackerId) return [];
      const records = await pb.collection('points').getFullList<Point>({
        filter: `tracker_id = "${trackerId}"`,
        sort: '-created',
      });
      return records;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (!trackerId) return;

    const subscription = pb.collection('points').subscribe(`tracker_id="${trackerId}"`, (data) => {
      mutate((prev) => {
        if (!prev) return [data.record];
        return [data.record, ...prev];
      }, false);
    });

    return () => {
      pb.collection('points').unsubscribe();
    };
  }, [trackerId, mutate]);

  return {
    points: data || [],
    isLoading,
    isError: error,
  };
}