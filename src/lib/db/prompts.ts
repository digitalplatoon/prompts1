// src/lib/db/prompts.ts
// Data access layer for prompts and categories
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * Strips characters that are syntax separators in PostgREST's filter
 * mini-language so user input can never inject extra filter clauses.
 */
export function sanitizeFilterValue(value: string): string {
  return value
    .trim()
    .replace(/[,().:*"'\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 100)
    .trim();
}

// Re-export types from Supabase schema
export type PromptCategory = Tables<"prompt_categories">;
export type Prompt = Tables<"prompts">;

// Extended type with category info joined
export type PromptWithCategory = Prompt & {
  prompt_categories?: Pick<PromptCategory, "id" | "slug" | "name" | "icon" | "color"> | null;
};

// Legacy ID mapping for backward compatibility with /prompt/:id routes
// Maps old numeric string IDs to new slugs
const LEGACY_ID_TO_SLUG: Record<string, string> = {
  "1": "ultimate-blog-post-generator",
  "2": "cinematic-scene-generator",
  "3": "code-review-assistant",
  "4": "marketing-campaign-planner",
  "5": "business-plan-generator",
  "6": "fantasy-world-builder",
  "7": "claude-research-assistant",
  "8": "product-photography-style",
};

// ===================
// Category Functions
// ===================

/**
 * Fetch all categories ordered by sort_order, then name
 */
export async function getCategories(): Promise<PromptCategory[]> {
  const { data, error } = await supabase
    .from("prompt_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories error:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<PromptCategory | null> {
  const { data, error } = await supabase
    .from("prompt_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug error:", error);
    return null;
  }
  return data;
}

// ===================
// Prompt Functions
// ===================

export interface GetPromptsOptions {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "price_cents" | "average_rating" | "title";
  orderAsc?: boolean;
}

// Fields to select for public prompt queries (excludes full_prompt for security)
const PUBLIC_PROMPT_FIELDS = `
  id, slug, title, short_description, preview,
  category_id, price_cents, currency, average_rating,
  rating_count, tags, is_featured, status, created_at, updated_at,
  usage_instructions, example_outputs, created_by,
  prompt_categories (id, slug, name, icon, color)
`;

/**
 * Fetch published prompts with optional filters, pagination, and sorting
 * Note: full_prompt is excluded for security - use getPurchasedPromptContent for purchased prompts
 */
export async function getPublishedPrompts(options: GetPromptsOptions = {}): Promise<PromptWithCategory[]> {
  const {
    categorySlug,
    categoryId,
    search,
    minPrice,
    maxPrice,
    minRating,
    isFeatured,
    limit = 24,
    offset = 0,
    orderBy = "created_at",
    orderAsc = false,
  } = options;

  let query = supabase
    .from("prompts")
    .select(PUBLIC_PROMPT_FIELDS)
    .eq("status", "published");

  // Category filter by ID
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  // Category filter by slug (requires join lookup)
  if (categorySlug && !categoryId) {
    // First get category ID from slug
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      query = query.eq("category_id", category.id);
    } else {
      return []; // Category not found
    }
  }

  // Search filter (title and short_description)
  if (search?.trim()) {
    const searchTerm = `%${sanitizeFilterValue(search)}%`;
    query = query.or(`title.ilike.${searchTerm},short_description.ilike.${searchTerm}`);
  }

  // Price filters (in cents)
  if (minPrice !== undefined) {
    query = query.gte("price_cents", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte("price_cents", maxPrice);
  }

  // Rating filter
  if (minRating !== undefined) {
    query = query.gte("average_rating", minRating);
  }

  // Featured filter
  if (isFeatured !== undefined) {
    query = query.eq("is_featured", isFeatured);
  }

  // Ordering
  query = query.order(orderBy, { ascending: orderAsc });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedPrompts error:", error);
    return [];
  }

  return (data ?? []) as PromptWithCategory[];
}

/**
 * Fetch featured prompts for homepage
 */
export async function getFeaturedPrompts(limit = 6): Promise<PromptWithCategory[]> {
  return getPublishedPrompts({
    isFeatured: true,
    limit,
    orderBy: "created_at",
    orderAsc: false,
  });
}

/**
 * Fetch a single prompt by UUID
 * Note: full_prompt is excluded for security - use getPurchasedPromptContent for purchased prompts
 */
export async function getPromptById(id: string): Promise<PromptWithCategory | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select(PUBLIC_PROMPT_FIELDS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPromptById error:", error);
    return null;
  }
  return data as PromptWithCategory | null;
}

/**
 * Fetch a single prompt by slug
 * Note: full_prompt is excluded for security - use getPurchasedPromptContent for purchased prompts
 */
export async function getPromptBySlug(slug: string): Promise<PromptWithCategory | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select(PUBLIC_PROMPT_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPromptBySlug error:", error);
    return null;
  }
  return data as PromptWithCategory | null;
}

/**
 * Fetch a prompt by legacy numeric ID, slug, or UUID (for backward compatibility)
 * Handles old "1", "2" IDs, new slugs like "ultimate-blog-post-generator", and UUIDs
 */
export async function getPromptByLegacyId(identifier: string): Promise<PromptWithCategory | null> {
  // Check if it's a legacy numeric ID
  const slug = LEGACY_ID_TO_SLUG[identifier];
  if (slug) {
    return getPromptBySlug(slug);
  }
  
  // Try as slug first (most common new case)
  const bySlug = await getPromptBySlug(identifier);
  if (bySlug) return bySlug;
  
  // Finally try as UUID
  return getPromptById(identifier);
}

/**
 * Get related prompts (same category, excluding current)
 * Note: full_prompt is excluded for security
 */
export async function getRelatedPrompts(
  promptId: string,
  categoryId: string | null,
  limit = 4
): Promise<PromptWithCategory[]> {
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("prompts")
    .select(PUBLIC_PROMPT_FIELDS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", promptId)
    .limit(limit);

  if (error) {
    console.error("getRelatedPrompts error:", error);
    return [];
  }

  return (data ?? []) as PromptWithCategory[];
}

/**
 * Count total published prompts (for pagination)
 */
export async function countPublishedPrompts(options: Omit<GetPromptsOptions, "limit" | "offset" | "orderBy" | "orderAsc"> = {}): Promise<number> {
  const { categorySlug, categoryId, search, minPrice, maxPrice, minRating, isFeatured } = options;

  let query = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (categorySlug && !categoryId) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      query = query.eq("category_id", category.id);
    } else {
      return 0;
    }
  }

  if (search?.trim()) {
    const searchTerm = `%${sanitizeFilterValue(search)}%`;
    query = query.or(`title.ilike.${searchTerm},short_description.ilike.${searchTerm}`);
  }

  if (minPrice !== undefined) query = query.gte("price_cents", minPrice);
  if (maxPrice !== undefined) query = query.lte("price_cents", maxPrice);
  if (minRating !== undefined) query = query.gte("average_rating", minRating);
  if (isFeatured !== undefined) query = query.eq("is_featured", isFeatured);

  const { count, error } = await query;

  if (error) {
    console.error("countPublishedPrompts error:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get prompts count per category (for category cards)
 */
export async function getPromptCountsByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("prompts")
    .select("category_id")
    .eq("status", "published");

  if (error) {
    console.error("getPromptCountsByCategory error:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Securely fetch full_prompt content for a purchased prompt
 * Only returns content if the authenticated user has purchased the prompt
 */
export async function getPurchasedPromptContent(promptId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_purchased_prompt_content", {
    p_prompt_id: promptId,
  });

  if (error) {
    console.error("getPurchasedPromptContent error:", error);
    return null;
  }

  // RPC returns an array of rows
  return data?.[0]?.full_prompt ?? null;
}
