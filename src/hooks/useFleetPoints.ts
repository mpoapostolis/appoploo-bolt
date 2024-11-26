import { useEffect } from "react";
import useSWR from "swr";
import { pb } from "../lib/pocketbase";
import type { Point } from "../types/fleet";
import { useFleetStore } from "../store/fleetStore";
import { format } from "date-fns";

export function useFleetPoints() {
  const {
    selectedFleetId: trackerId,
    setSelectedFleetId,
    dateRange,
  } = useFleetStore();

  const { data, error, isLoading, mutate } = useSWR<Point[]>(
    dateRange.start && trackerId
      ? `points-${trackerId}&${dateRange.start}`
      : null,
    async () => {
      if (!trackerId) return [];
      const records = await pb.collection("points").getFullList<Point>({
        filter: `tracker_id = "${trackerId}" && created >= "${format(
          // @ts-ignore
          new Date(dateRange.start),
          "yyyy-MM-dd"
        )}" `,
        sort: "-created",
      });
      return records;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    points: data || [],
    isLoading,
    isError: error,
  };
}
