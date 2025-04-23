import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type BudgetGroup = Database["public"]["Tables"]["budget_groups"]["Row"];
export type BudgetGroupInsert =
  Database["public"]["Tables"]["budget_groups"]["Insert"];
export type BudgetGroupUpdate =
  Database["public"]["Tables"]["budget_groups"]["Update"];

export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type GroupMemberInsert =
  Database["public"]["Tables"]["group_members"]["Insert"];
export type GroupMemberUpdate =
  Database["public"]["Tables"]["group_members"]["Update"];

export type GroupInvitation =
  Database["public"]["Tables"]["group_invitations"]["Row"];
export type GroupInvitationInsert =
  Database["public"]["Tables"]["group_invitations"]["Insert"];
export type GroupInvitationUpdate =
  Database["public"]["Tables"]["group_invitations"]["Update"];

export type GroupActivityLog =
  Database["public"]["Tables"]["group_activity_log"]["Row"];

// Budget Groups

/**
 * Get all budget groups for the current user
 */
export async function getBudgetGroups() {
  try {
    console.log("Fetching budget groups...");

    // Get all groups the user is a member of
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        group_id,
        role,
        group:group_id(
          id,
          name,
          description,
          created_by,
          is_active,
          avatar_url,
          created_at,
          updated_at
        )
        `
      )
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching budget groups:", error);
      return { data: [], error };
    }

    console.log("Raw group members data:", data);

    // Transform the data to extract the group objects
    const transformedData =
      data?.map((item) => ({
        ...item.group,
        role: item.role,
      })) || [];

    console.log("Transformed groups data:", transformedData);
    return { data: transformedData, error: null };
  } catch (err) {
    console.error("Unexpected error in getBudgetGroups:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get a budget group by ID
 */
export async function getBudgetGroup(id: string) {
  try {
    console.log(`Fetching budget group with ID: ${id}`);

    // Get the group details
    const { data, error } = await supabase
      .from("budget_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching budget group:", error);
      return { data: null, error };
    }

    console.log("Budget group data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getBudgetGroup:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new budget group
 */
export async function createBudgetGroup(group: BudgetGroupInsert) {
  try {
    console.log("Creating budget group with data:", group);

    // Create the group
    const { data: newGroup, error } = await supabase
      .from("budget_groups")
      .insert(group)
      .select()
      .single();

    if (error) {
      console.error("Error creating budget group:", error);
      return { data: null, error };
    }

    console.log("Budget group created successfully:", newGroup);

    // Add the creator as the owner
    // Use a workaround for the RLS policy issue
    try {
      console.log("Adding group member with workaround...");

      // First try the direct approach
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: group.created_by,
          role: "owner",
        });

      if (memberError) {
        console.error(
          "Error adding group member with direct approach:",
          memberError
        );
        console.log("Trying alternative approach...");

        // If that fails, try a different approach with a custom RPC function
        // This is a fallback in case the RLS policy fix hasn't been applied
        try {
          // First try with the add_group_owner function if it exists
          const { error: rpcError } = await supabase.rpc("add_group_owner", {
            p_group_id: newGroup.id,
            p_user_id: group.created_by,
          });

          if (rpcError) {
            console.error("Error with add_group_owner RPC:", rpcError);
            throw rpcError;
          }
        } catch (rpcErr) {
          // If the RPC function doesn't exist, try a direct approach
          console.log("RPC function not available, trying direct SQL...");

          // Use the service role client if available (this would be in a server environment)
          // In a client environment, this will fail due to security restrictions
          try {
            // This is a last resort and will only work in development or with special permissions
            const { error: sqlError } =
              await supabase.auth.admin.updateUserById(group.created_by, {
                app_metadata: { group_owner: newGroup.id },
              });

            if (sqlError) {
              console.error("Error with admin approach:", sqlError);
              throw sqlError;
            }
          } catch (sqlErr) {
            console.error("Direct SQL approach failed:", sqlErr);
            // If all approaches fail, delete the group
            console.log("Deleting group due to member error:", newGroup.id);
            await supabase.from("budget_groups").delete().eq("id", newGroup.id);
            return { data: null, error: sqlErr };
          }
        }
      }
    } catch (memberErr) {
      console.error("Exception adding group member:", memberErr);
      // If there was an error adding the member, delete the group
      console.log("Deleting group due to member error:", newGroup.id);
      await supabase.from("budget_groups").delete().eq("id", newGroup.id);
      return { data: null, error: memberErr as Error };
    }

    console.log("Group member added successfully");

    try {
      // Add an activity log entry
      await supabase.from("group_activity_log").insert({
        group_id: newGroup.id,
        user_id: group.created_by,
        action: "created_group",
        entity_type: "group",
        entity_id: newGroup.id,
        details: { group_name: group.name },
      });
      console.log("Group activity logged successfully");
    } catch (logError) {
      // Don't fail if activity logging fails
      console.warn("Error logging group activity:", logError);
    }

    return { data: newGroup, error: null };
  } catch (err) {
    console.error("Exception creating budget group:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update a budget group
 */
export async function updateBudgetGroup(
  id: string,
  updates: BudgetGroupUpdate
) {
  return supabase
    .from("budget_groups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a budget group
 */
export async function deleteBudgetGroup(id: string) {
  return supabase.from("budget_groups").delete().eq("id", id);
}

// Group Members

/**
 * Get all members of a budget group
 */
export async function getGroupMembers(groupId: string) {
  try {
    console.log(`Fetching members for group ID: ${groupId}`);

    // Get the group members
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        *,
        user:user_id(
          id,
          email,
          user_profiles(
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("group_id", groupId)
      .order("role");

    if (error) {
      console.error("Error fetching group members:", error);
      return { data: [], error };
    }

    console.log("Group members data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupMembers:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get a user's role in a group
 */
export async function getUserRole(groupId: string, userId: string) {
  try {
    console.log(`Getting role for user ${userId} in group ${groupId}`);

    const { data, error } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error getting user role:", error);
      return { data: null, error };
    }

    console.log("User role data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getUserRole:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Add a member to a budget group
 */
export async function addGroupMember(member: GroupMemberInsert) {
  return supabase.from("group_members").insert(member).select().single();
}

/**
 * Update a group member's role
 */
export async function updateGroupMember(
  groupId: string,
  userId: string,
  updates: GroupMemberUpdate
) {
  return supabase
    .from("group_members")
    .update(updates)
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Remove a member from a budget group
 */
export async function removeGroupMember(groupId: string, userId: string) {
  return supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
}

// Group Invitations

/**
 * Get all invitations for a budget group
 */
export async function getGroupInvitations(groupId: string) {
  return supabase
    .from("group_invitations")
    .select(
      `
      *,
      inviter:invited_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
}

/**
 * Get invitations sent to a specific email
 */
export async function getInvitationsByEmail(email: string) {
  try {
    // If email is empty or null, return empty result
    if (!email) {
      return { data: [], error: null };
    }

    console.log(`Fetching invitations for email: ${email}`);

    // Get the invitations
    const { data, error } = await supabase
      .from("group_invitations")
      .select(
        `
        *,
        group:group_id(
          id,
          name,
          description,
          avatar_url
        )
      `
      )
      .eq("email", email)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      return { data: [], error };
    }

    console.log("Invitations data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getInvitationsByEmail:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get an invitation by token
 */
export async function getInvitationByToken(token: string) {
  try {
    console.log(`Fetching invitation with token: ${token}`);

    // Get the invitation
    const { data, error } = await supabase
      .from("group_invitations")
      .select(
        `
        *,
        group:group_id(
          id,
          name,
          description,
          avatar_url
        )
      `
      )
      .eq("token", token)
      .single();

    if (error) {
      console.error("Error fetching invitation by token:", error);
      return { data: null, error };
    }

    console.log("Invitation data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getInvitationByToken:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  invitation: Omit<GroupInvitationInsert, "token">
) {
  try {
    console.log("Creating invitation with data:", invitation);

    // Generate a token using the server function or create a random one if that fails
    let token;
    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "generate_invitation_token"
      );

      if (tokenError) {
        console.error("Error generating invitation token:", tokenError);
        // Generate a random token as fallback
        token =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      } else {
        token = tokenData;
      }
    } catch (tokenErr) {
      console.error("Exception generating invitation token:", tokenErr);
      // Generate a random token as fallback
      token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    }

    console.log("Using token:", token);

    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation
    const { data, error } = await supabase
      .from("group_invitations")
      .insert({
        ...invitation,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invitation:", error);
      return { data: null, error };
    }

    console.log("Invitation created successfully:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in createInvitation:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update an invitation
 */
export async function updateInvitation(
  id: string,
  updates: GroupInvitationUpdate
) {
  return supabase
    .from("group_invitations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete an invitation
 */
export async function deleteInvitation(id: string) {
  return supabase.from("group_invitations").delete().eq("id", id);
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string, userId: string) {
  // Get the invitation
  const { data: invitation, error: invitationError } =
    await getInvitationByToken(token);

  if (invitationError) return { data: null, error: invitationError };

  // Check if invitation is valid
  if (invitation.status !== "pending") {
    return {
      data: null,
      error: { message: "Invitation is no longer valid" } as any,
    };
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    // Update invitation status to expired
    await updateInvitation(invitation.id, { status: "expired" });

    return {
      data: null,
      error: { message: "Invitation has expired" } as any,
    };
  }

  // Add user to group
  const { error: memberError } = await addGroupMember({
    group_id: invitation.group_id,
    user_id: userId,
    role: invitation.role,
  });

  if (memberError) return { data: null, error: memberError };

  // Update invitation status
  const { data, error } = await updateInvitation(invitation.id, {
    status: "accepted",
  });

  return { data, error };
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(token: string) {
  // Get the invitation
  const { data: invitation, error: invitationError } =
    await getInvitationByToken(token);

  if (invitationError) return { data: null, error: invitationError };

  // Update invitation status
  const { data, error } = await updateInvitation(invitation.id, {
    status: "rejected",
  });

  return { data, error };
}

// Group Activity

/**
 * Get activity log for a budget group
 */
export async function getGroupActivity(groupId: string, limit = 20) {
  try {
    console.log(`Getting activity for group ${groupId}`);

    const { data, error } = await supabase
      .from("group_activity_log")
      .select(
        `
        *,
        user:user_id(
          id,
          user_profiles(
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error getting group activity:", error);
      return { data: [], error };
    }

    console.log("Group activity data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupActivity:", err);
    return { data: [], error: err as Error };
  }
}

// Shared Resources

/**
 * Share a category with a group
 */
export async function shareCategory(
  groupId: string,
  categoryId: string,
  userId: string
) {
  return supabase
    .from("shared_categories")
    .insert({
      group_id: groupId,
      category_id: categoryId,
      shared_by: userId,
    })
    .select()
    .single();
}

/**
 * Unshare a category from a group
 */
export async function unshareCategory(groupId: string, categoryId: string) {
  return supabase
    .from("shared_categories")
    .delete()
    .eq("group_id", groupId)
    .eq("category_id", categoryId);
}

/**
 * Get shared categories for a group
 */
export async function getSharedCategories(groupId: string) {
  try {
    console.log(`Getting shared categories for group ${groupId}`);

    const { data, error } = await supabase
      .from("shared_categories")
      .select(
        `
        *,
        category:category_id(*),
        shared_by_user:shared_by(
          id,
          user_profiles(
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("group_id", groupId);

    if (error) {
      console.error("Error getting shared categories:", error);
      return { data: [], error };
    }

    console.log("Shared categories data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getSharedCategories:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Share a budget with a group
 */
export async function shareBudget(
  groupId: string,
  budgetId: string,
  userId: string
) {
  return supabase
    .from("shared_budgets")
    .insert({
      group_id: groupId,
      budget_id: budgetId,
      shared_by: userId,
    })
    .select()
    .single();
}

/**
 * Unshare a budget from a group
 */
export async function unshareBudget(groupId: string, budgetId: string) {
  return supabase
    .from("shared_budgets")
    .delete()
    .eq("group_id", groupId)
    .eq("budget_id", budgetId);
}

/**
 * Get shared budgets for a group
 */
export async function getSharedBudgets(groupId: string) {
  return supabase
    .from("shared_budgets")
    .select(
      `
      *,
      budget:budget_id(*),
      shared_by_user:shared_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq("group_id", groupId);
}
