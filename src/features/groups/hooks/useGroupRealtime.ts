import { useEffect } from "react";
import { supabase } from "@/api/supabase/client";

/**
 * Hook for subscribing to real-time updates for a group.
 * Calls the provided callbacks on data changes for members, activity, or group info.
 */
export function useGroupRealtime({
  groupId,
  onMembers,
  onActivity,
  onGroupInfo,
}: {
  groupId: string;
  onMembers?: () => void;
  onActivity?: () => void;
  onGroupInfo?: () => void;
}) {
  useEffect(() => {
    if (!groupId) return;
    // Using RealtimeChannel type for Supabase channels
    const channels: Array<{ unsubscribe: () => void }> = [];

    // Members
    if (onMembers) {
      const memberChannel = supabase
        .channel(`group-members-${groupId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
          () => {
            onMembers();
          }
        )
        .subscribe();
      channels.push(memberChannel);
    }
    // Activity
    if (onActivity) {
      const activityChannel = supabase
        .channel(`group-activity-${groupId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_activity', filter: `group_id=eq.${groupId}` },
          () => {
            onActivity();
          }
        )
        .subscribe();
      channels.push(activityChannel);
    }
    // Group Info
    if (onGroupInfo) {
      const groupChannel = supabase
        .channel(`budget-groups-${groupId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'budget_groups', filter: `id=eq.${groupId}` },
          () => {
            onGroupInfo();
          }
        )
        .subscribe();
      channels.push(groupChannel);
    }
    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, [groupId, onMembers, onActivity, onGroupInfo]);
}
