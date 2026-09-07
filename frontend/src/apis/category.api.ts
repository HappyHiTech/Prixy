import apiFetch from './apiClient';

import type { Category } from '@/types/category';

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/categories`);
}
