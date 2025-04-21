import { supabase } from './client';
import type { Database } from '../../lib/database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

/**
 * Get all categories for the current user
 */
export async function getCategories() {
  return supabase
    .from('categories')
    .select('*')
    .order('name');
}

/**
 * Get categories by type (expense, income, or both)
 */
export async function getCategoriesByType(type: 'expense' | 'income' | 'both') {
  return supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name');
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  return supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Create a new category
 */
export async function createCategory(category: CategoryInsert) {
  return supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, category: CategoryUpdate) {
  return supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  return supabase
    .from('categories')
    .delete()
    .eq('id', id);
}

/**
 * Get default categories
 */
export async function getDefaultCategories() {
  return supabase
    .from('categories')
    .select('*')
    .eq('is_default', true)
    .order('name');
}

/**
 * Get expense categories
 */
export async function getExpenseCategories() {
  return supabase
    .from('categories')
    .select('*')
    .in('type', ['expense', 'both'])
    .order('name');
}

/**
 * Get income categories
 */
export async function getIncomeCategories() {
  return supabase
    .from('categories')
    .select('*')
    .in('type', ['income', 'both'])
    .order('name');
}
