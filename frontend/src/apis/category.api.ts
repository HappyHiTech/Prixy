import apiFetch from './apiClient';

import type { Category } from '@/types/category';

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/categories`);
}

export async function createCategory(input: {
  name: string;
  icon: string;
}): Promise<Category> {
  return apiFetch<Category>(`/categories`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
