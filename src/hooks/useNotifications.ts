import { useEffect } from "react";
import useSWR from "swr";
import { pb } from "../lib/pocketbase";
import type { Notification } from "../types/notification";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(
    "notifications",
    async () => {
      const records = await pb
        .collection("notifications")
        .getFullList<Notification>({
          sort: "-created",
          expand: "tracker_id",
        });
      return records;
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const markAsRead = async (id: string) => {
    try {
      await pb.collection("notifications").update(id, { read: true });
      await mutate();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = data?.filter((n) => !n.read) || [];
      await Promise.all(
        unreadNotifications.map((n) =>
          pb.collection("notifications").update(n.id, { read: true })
        )
      );
      await mutate();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return {
    notifications: data || [],
    isLoading,
    isError: error,
    mutate,
    markAsRead,
    markAllAsRead,
  };
}
