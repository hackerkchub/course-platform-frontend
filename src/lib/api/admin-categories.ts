import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  CategoryItem,
  SubcategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
} from '@/types/admin-category';
import type { ApiResponse } from '@/types/api';

export const adminCategoriesApi = {
  // Categories
  async getCategories(): Promise<CategoryItem[]> {
    const res = await apiClient.get<ApiResponse<CategoryItem[]>>(
      API_ENDPOINTS.categories.adminList
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getCategoryById(id: number): Promise<CategoryItem> {
    const res = await apiClient.get<ApiResponse<CategoryItem>>(
      API_ENDPOINTS.categories.adminById(id)
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to load category');
    }
    return res.data.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<CategoryItem> {
    const res = await apiClient.post<ApiResponse<CategoryItem>>(
      API_ENDPOINTS.categories.adminCreate,
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create category');
    }
    return res.data.data;
  },

  async updateCategory(id: number, payload: UpdateCategoryPayload): Promise<CategoryItem> {
    const res = await apiClient.patch<ApiResponse<CategoryItem>>(
      API_ENDPOINTS.categories.adminUpdate(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update category');
    }
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.categories.adminDelete(id)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete category');
    }
  },

  async reorderCategories(items: Array<{ id: number; display_order: number }>): Promise<void> {
    const res = await apiClient.patch<ApiResponse<null>>(
      API_ENDPOINTS.categories.adminReorder,
      { items, categories: items }
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to reorder categories');
    }
  },

  // Subcategories
  async getSubcategories(categoryId?: number): Promise<SubcategoryItem[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    const res = await apiClient.get<ApiResponse<SubcategoryItem[]>>(
      API_ENDPOINTS.subcategories.adminList,
      { params }
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getSubcategoryById(id: number): Promise<SubcategoryItem> {
    const res = await apiClient.get<ApiResponse<SubcategoryItem>>(
      API_ENDPOINTS.subcategories.adminById(id)
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to load subcategory');
    }
    return res.data.data;
  },

  async createSubcategory(payload: CreateSubcategoryPayload): Promise<SubcategoryItem> {
    const res = await apiClient.post<ApiResponse<SubcategoryItem>>(
      API_ENDPOINTS.subcategories.adminCreate,
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create subcategory');
    }
    return res.data.data;
  },

  async updateSubcategory(id: number, payload: UpdateSubcategoryPayload): Promise<SubcategoryItem> {
    const res = await apiClient.patch<ApiResponse<SubcategoryItem>>(
      API_ENDPOINTS.subcategories.adminUpdate(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update subcategory');
    }
    return res.data.data;
  },

  async deleteSubcategory(id: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.subcategories.adminDelete(id)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete subcategory');
    }
  },

  async reorderSubcategories(items: Array<{ id: number; display_order: number }>): Promise<void> {
    const res = await apiClient.patch<ApiResponse<null>>(
      API_ENDPOINTS.subcategories.adminReorder,
      { items, subcategories: items }
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to reorder subcategories');
    }
  },
};
