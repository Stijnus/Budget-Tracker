import { supabase } from './client';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TagInsert {
  user_id: string;
  name: string;
  color: string;
}

/**
 * Get all tags for the current user
 */
export async function getTags() {
  return supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });
}

/**
 * Get a specific tag by ID
 */
export async function getTagById(id: string) {
  return supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Create a new tag
 */
export async function createTag(tag: TagInsert) {
  return supabase
    .from('tags')
    .insert(tag)
    .select()
    .single();
}

/**
 * Update an existing tag
 */
export async function updateTag(id: string, tag: Partial<TagInsert>) {
  return supabase
    .from('tags')
    .update(tag)
    .eq('id', id)
    .select()
    .single();
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string) {
  return supabase
    .from('tags')
    .delete()
    .eq('id', id);
}

/**
 * Get tags for a specific transaction
 */
export async function getTagsForTransaction(transactionId: string) {
  return supabase
    .from('transaction_tags')
    .select(`
      tag_id,
      tags:tag_id (
        id,
        name,
        color
      )
    `)
    .eq('transaction_id', transactionId);
}

/**
 * Add a tag to a transaction
 */
export async function addTagToTransaction(transactionId: string, tagId: string) {
  return supabase
    .from('transaction_tags')
    .insert({
      transaction_id: transactionId,
      tag_id: tagId
    });
}

/**
 * Remove a tag from a transaction
 */
export async function removeTagFromTransaction(transactionId: string, tagId: string) {
  return supabase
    .from('transaction_tags')
    .delete()
    .eq('transaction_id', transactionId)
    .eq('tag_id', tagId);
}

/**
 * Remove all tags from a transaction
 */
export async function removeAllTagsFromTransaction(transactionId: string) {
  return supabase
    .from('transaction_tags')
    .delete()
    .eq('transaction_id', transactionId);
}

/**
 * Get transactions by tag
 */
export async function getTransactionsByTag(tagId: string) {
  return supabase
    .from('transaction_tags')
    .select(`
      transaction_id,
      transactions:transaction_id (
        id,
        amount,
        description,
        date,
        type,
        category_id,
        categories:category_id (
          name,
          color
        )
      )
    `)
    .eq('tag_id', tagId);
}
