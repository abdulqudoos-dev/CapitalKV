import { fetcher } from "@/utils/api";
import useSWR from "swr";

export function useMessages({
  groupId,
  groupName,
  receiptId,
}: {
  groupId?: string;
  groupName?: string;
  receiptId?: string;
}) {
  const { data, error, mutate } = useSWR(
    () => {
      if (groupId) return `/chats/messages?group_id=${groupId}`;
      if (groupName) return `/chats/messages?group_name=${groupName}`;
      if (receiptId) return `/chats/messages?receipt_id=${receiptId}`;
      return null; // Avoid fetching if no identifier is provided
    },
    fetcher,
    {
      refreshInterval: 2000, // Fetch messages every 2 seconds
    }
  );

  return {
    messages: data?.messages,
    isLoading: !error && !data,
    isError: error,
    mutateMessages: mutate, // Manually trigger re-fetch when needed
  };
}

export function useGroups() {
  const { data, error, mutate } = useSWR("/chats/groups/mine", fetcher, {
    refreshInterval: 0, // No periodic re-fetching; will trigger manually
  });

  return {
    groups: data?.groups,
    isLoading: !error && !data,
    isError: error,
    mutateGroups: mutate, // Manually trigger re-fetch when needed
  };
}
