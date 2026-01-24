// src/hooks/usePrompts.ts
// React Query hooks for prompts data access
import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryBySlug,
  getPublishedPrompts,
  getFeaturedPrompts,
  getPromptById,
  getPromptBySlug,
  getPromptByLegacyId,
  getRelatedPrompts,
  countPublishedPrompts,
  getPromptCountsByCategory,
  type GetPromptsOptions,
  type PromptCategory,
  type PromptWithCategory,
} from "@/lib/db/prompts";

// Re-export types
export type { PromptCategory, PromptWithCategory, GetPromptsOptions };

// ===================
// Category Hooks
// ===================

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => (slug ? getCategoryBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// ===================
// Prompt Hooks
// ===================

export function usePublishedPrompts(options: GetPromptsOptions = {}) {
  return useQuery({
    queryKey: ["prompts", "published", options],
    queryFn: () => getPublishedPrompts(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedPrompts(limit = 6) {
  return useQuery({
    queryKey: ["prompts", "featured", limit],
    queryFn: () => getFeaturedPrompts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromptById(id: string | undefined) {
  return useQuery({
    queryKey: ["prompt", "id", id],
    queryFn: () => (id ? getPromptById(id) : null),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePromptBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["prompt", "slug", slug],
    queryFn: () => (slug ? getPromptBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for backward compatibility with /prompt/:id routes
 * Handles both legacy numeric IDs and new UUIDs
 */
export function usePromptByLegacyId(id: string | undefined) {
  return useQuery({
    queryKey: ["prompt", "legacy", id],
    queryFn: () => (id ? getPromptByLegacyId(id) : null),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRelatedPrompts(promptId: string | undefined, categoryId: string | null | undefined, limit = 4) {
  return useQuery({
    queryKey: ["prompts", "related", promptId, categoryId, limit],
    queryFn: () => (promptId && categoryId ? getRelatedPrompts(promptId, categoryId, limit) : []),
    enabled: !!promptId && !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePromptsCount(options: Omit<GetPromptsOptions, "limit" | "offset" | "orderBy" | "orderAsc"> = {}) {
  return useQuery({
    queryKey: ["prompts", "count", options],
    queryFn: () => countPublishedPrompts(options),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePromptCountsByCategory() {
  return useQuery({
    queryKey: ["prompts", "countsByCategory"],
    queryFn: getPromptCountsByCategory,
    staleTime: 5 * 60 * 1000,
  });
}
