import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Subscribe to records changes
export const subscribeToRecords = (
  callback: () => void
): RealtimeChannel => {
  const channel = supabase
    .channel("paro_records_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "paro_records",
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to AI roles changes
export const subscribeToAIRoles = (
  callback: () => void
): RealtimeChannel => {
  const channel = supabase
    .channel("ai_roles_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ai_roles",
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return channel;
};

// Unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
