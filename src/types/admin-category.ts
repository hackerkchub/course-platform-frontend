export type TaxonomyStatus = 'active' | 'inactive';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  display_order: number;
  status: TaxonomyStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  subcategories_count?: number;
  courses_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface SubcategoryItem {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  display_order: number;
  status: TaxonomyStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  courses_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  display_order?: number;
  status?: TaxonomyStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface CreateSubcategoryPayload {
  category_id: number;
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  display_order?: number;
  status?: TaxonomyStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
}

export type UpdateSubcategoryPayload = Partial<CreateSubcategoryPayload>;
