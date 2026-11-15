'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DashboardHeading,
  DashboardSection,
  DataTable,
  SearchFilterToolbar,
  DataTableColumn,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminCategoriesApi } from '@/lib/api/admin-categories';
import { getErrorMessage, slugify } from '@/lib/utils';
import type {
  CategoryItem,
  SubcategoryItem,
  TaxonomyStatus,
} from '@/types/admin-category';
import {
  FolderTree,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Subcategories state
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState<boolean>(true);
  const [subcategorySearch, setSubcategorySearch] = useState<string>('');
  const [subcatParentFilter, setSubcatParentFilter] = useState<string>('all');

  // Global alerts
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Modals & Dialogs
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState<boolean>(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryItem | null>(null);

  const [deleteCatTarget, setDeleteCatTarget] = useState<CategoryItem | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState<boolean>(false);

  const [deleteSubcatTarget, setDeleteSubcatTarget] = useState<SubcategoryItem | null>(null);
  const [isDeletingSubcat, setIsDeletingSubcat] = useState<boolean>(false);

  // Category Form State
  const [catName, setCatName] = useState<string>('');
  const [catSlug, setCatSlug] = useState<string>('');
  const [catDescription, setCatDescription] = useState<string>('');
  const [catIconUrl, setCatIconUrl] = useState<string>('');
  const [catStatus, setCatStatus] = useState<TaxonomyStatus>('active');
  const [catDisplayOrder, setCatDisplayOrder] = useState<number>(0);
  const [isSubmittingCat, setIsSubmittingCat] = useState<boolean>(false);

  // Subcategory Form State
  const [subcatCategoryId, setSubcatCategoryId] = useState<number | ''>('');
  const [subcatName, setSubcatName] = useState<string>('');
  const [subcatSlug, setSubcatSlug] = useState<string>('');
  const [subcatDescription, setSubcatDescription] = useState<string>('');
  const [subcatImageUrl, setSubcatImageUrl] = useState<string>('');
  const [subcatStatus, setSubcatStatus] = useState<TaxonomyStatus>('active');
  const [subcatDisplayOrder, setSubcatDisplayOrder] = useState<number>(0);
  const [isSubmittingSubcat, setIsSubmittingSubcat] = useState<boolean>(false);

  // Load Categories
  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    setError('');
    try {
      const data = await adminCategoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Load Subcategories
  const fetchSubcategories = useCallback(async () => {
    setIsSubcategoriesLoading(true);
    setError('');
    try {
      const data = await adminCategoriesApi.getSubcategories();
      setSubcategories(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch subcategories'));
    } finally {
      setIsSubcategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, [fetchCategories, fetchSubcategories]);

  // Open Category Create / Edit
  const openCategoryModal = useCallback((cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatDescription(cat.description || '');
      setCatIconUrl(cat.icon_url || '');
      setCatStatus(cat.status);
      setCatDisplayOrder(cat.display_order || 0);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatSlug('');
      setCatDescription('');
      setCatIconUrl('');
      setCatStatus('active');
      setCatDisplayOrder(categories.length);
    }
    setIsCategoryModalOpen(true);
  }, [categories.length]);

  // Open Subcategory Create / Edit
  const openSubcategoryModal = useCallback((subcat?: SubcategoryItem) => {
    if (subcat) {
      setEditingSubcategory(subcat);
      setSubcatCategoryId(subcat.category_id);
      setSubcatName(subcat.name);
      setSubcatSlug(subcat.slug);
      setSubcatDescription(subcat.description || '');
      setSubcatImageUrl(subcat.image_url || '');
      setSubcatStatus(subcat.status);
      setSubcatDisplayOrder(subcat.display_order || 0);
    } else {
      setEditingSubcategory(null);
      setSubcatCategoryId(categories[0]?.id || '');
      setSubcatName('');
      setSubcatSlug('');
      setSubcatDescription('');
      setSubcatImageUrl('');
      setSubcatStatus('active');
      setSubcatDisplayOrder(subcategories.length);
    }
    setIsSubcategoryModalOpen(true);
  }, [categories, subcategories.length]);

  // Submit Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSubmittingCat(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim() || slugify(catName),
        description: catDescription.trim() || null,
        icon_url: catIconUrl.trim() || null,
        status: catStatus,
        display_order: Number(catDisplayOrder),
      };

      if (editingCategory) {
        await adminCategoriesApi.updateCategory(editingCategory.id, payload);
        setSuccess(`Category "${catName}" updated successfully.`);
      } else {
        await adminCategoriesApi.createCategory(payload);
        setSuccess(`Category "${catName}" created successfully.`);
      }

      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save category'));
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Submit Subcategory
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcatName.trim() || !subcatCategoryId) return;

    setIsSubmittingSubcat(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        category_id: Number(subcatCategoryId),
        name: subcatName.trim(),
        slug: subcatSlug.trim() || slugify(subcatName),
        description: subcatDescription.trim() || null,
        image_url: subcatImageUrl.trim() || null,
        status: subcatStatus,
        display_order: Number(subcatDisplayOrder),
      };

      if (editingSubcategory) {
        await adminCategoriesApi.updateSubcategory(editingSubcategory.id, payload);
        setSuccess(`Subcategory "${subcatName}" updated successfully.`);
      } else {
        await adminCategoriesApi.createSubcategory(payload);
        setSuccess(`Subcategory "${subcatName}" created successfully.`);
      }

      setIsSubcategoryModalOpen(false);
      fetchSubcategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save subcategory'));
    } finally {
      setIsSubmittingSubcat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setIsDeletingCat(true);
    setError('');
    try {
      await adminCategoriesApi.deleteCategory(deleteCatTarget.id);
      setSuccess(`Category "${deleteCatTarget.name}" deleted.`);
      setDeleteCatTarget(null);
      fetchCategories();
      fetchSubcategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Cannot delete category (it may contain courses or subcategories)'));
      setDeleteCatTarget(null);
    } finally {
      setIsDeletingCat(false);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async () => {
    if (!deleteSubcatTarget) return;
    setIsDeletingSubcat(true);
    setError('');
    try {
      await adminCategoriesApi.deleteSubcategory(deleteSubcatTarget.id);
      setSuccess(`Subcategory "${deleteSubcatTarget.name}" deleted.`);
      setDeleteSubcatTarget(null);
      fetchSubcategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Cannot delete subcategory'));
      setDeleteSubcatTarget(null);
    } finally {
      setIsDeletingSubcat(false);
    }
  };

  // Filter lists
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((s) => {
      const matchesSearch =
        !subcategorySearch.trim() ||
        s.name.toLowerCase().includes(subcategorySearch.toLowerCase()) ||
        s.slug.toLowerCase().includes(subcategorySearch.toLowerCase());
      const matchesParent =
        subcatParentFilter === 'all' || s.category_id === Number(subcatParentFilter);
      return matchesSearch && matchesParent;
    });
  }, [subcategories, subcategorySearch, subcatParentFilter]);

  // Category Columns
  const categoryColumns: DataTableColumn<CategoryItem>[] = useMemo(
    () => [
      {
        key: 'order',
        header: '#',
        render: (cat) => <span className="font-mono text-xs text-slate-400">{cat.display_order}</span>,
        className: 'w-10 text-center',
      },
      {
        key: 'name',
        header: 'Category Name',
        render: (cat) => (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {cat.name}
            </span>
            <span className="text-xs text-slate-500 font-mono">/categories/{cat.slug}</span>
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (cat) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
            {cat.description || 'No description provided'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (cat) => (
          <Badge variant={cat.status === 'active' ? 'success' : 'default'}>
            {cat.status.toUpperCase()}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (cat) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCategoryModal(cat)}
              className="text-xs flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteCatTarget(cat)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [openCategoryModal]
  );

  // Subcategory Columns
  const subcategoryColumns: DataTableColumn<SubcategoryItem>[] = useMemo(
    () => [
      {
        key: 'order',
        header: '#',
        render: (sub) => <span className="font-mono text-xs text-slate-400">{sub.display_order}</span>,
        className: 'w-10 text-center',
      },
      {
        key: 'name',
        header: 'Subcategory Name',
        render: (sub) => (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {sub.name}
            </span>
            <span className="text-xs text-slate-500 font-mono">/{sub.slug}</span>
          </div>
        ),
      },
      {
        key: 'parent',
        header: 'Parent Category',
        render: (sub) => {
          const parent = categories.find((c) => c.id === sub.category_id);
          return (
            <Badge variant="accent" className="text-xs">
              {parent?.name || `Cat #${sub.category_id}`}
            </Badge>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (sub) => (
          <Badge variant={sub.status === 'active' ? 'success' : 'default'}>
            {sub.status.toUpperCase()}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (sub) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openSubcategoryModal(sub)}
              className="text-xs flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteSubcatTarget(sub)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [categories, openSubcategoryModal]
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Categories & Taxonomy' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeading
          title="Categories & Taxonomy Hierarchy"
          subtitle="Organize programs into overarching educational tracks and technical specializations."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'categories' ? (
            <Button
              onClick={() => openCategoryModal()}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </Button>
          ) : (
            <Button
              onClick={() => openSubcategoryModal()}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subcategory
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              fetchCategories();
              fetchSubcategories();
            }}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subcategories')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'subcategories'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Subcategories ({subcategories.length})
        </button>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <DashboardSection
          title="Parent Domain Categories"
          subtitle="Top-level catalog tracks shown in global navigation."
        >
          <SearchFilterToolbar
            searchPlaceholder="Search categories by name or slug..."
            onSearch={(q) => setCategorySearch(q)}
          />

          <DataTable
            columns={categoryColumns}
            data={filteredCategories}
            isLoading={isCategoriesLoading}
            emptyMessage="No categories found. Click 'Add Category' to get started."
          />
        </DashboardSection>
      )}

      {/* SUBCATEGORIES TAB */}
      {activeTab === 'subcategories' && (
        <DashboardSection
          title="Specialized Subcategories"
          subtitle="Focused skill tracks nested under parent categories."
        >
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <SearchFilterToolbar
                searchPlaceholder="Search subcategories..."
                onSearch={(q) => setSubcategorySearch(q)}
              />
            </div>
            <div className="sm:w-64">
              <select
                value={subcatParentFilter}
                onChange={(e) => setSubcatParentFilter(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200"
              >
                <option value="all">-- All Parent Categories --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DataTable
            columns={subcategoryColumns}
            data={filteredSubcategories}
            isLoading={isSubcategoriesLoading}
            emptyMessage="No subcategories found matching filters."
          />
        </DashboardSection>
      )}

      {/* Category Create / Edit Dialog */}
      <Dialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={catName}
              onChange={(e) => {
                setCatName(e.target.value);
                if (!editingCategory) setCatSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Cloud Computing & DevOps"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slug <span className="text-rose-500">*</span>
            </label>
            <Input
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              placeholder="cloud-computing-devops"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder="Short description for SEO and catalog navigation..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={catDisplayOrder}
                onChange={(e) => setCatDisplayOrder(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={catStatus}
                onChange={(e) => setCatStatus(e.target.value as TaxonomyStatus)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Icon / SVG URL (Optional)
            </label>
            <Input
              value={catIconUrl}
              onChange={(e) => setCatIconUrl(e.target.value)}
              placeholder="https://example.com/icons/cloud.svg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingCat}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmittingCat ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Subcategory Create / Edit Dialog */}
      <Dialog
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        title={editingSubcategory ? `Edit Subcategory: ${editingSubcategory.name}` : 'Create Subcategory'}
      >
        <form onSubmit={handleSaveSubcategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={subcatCategoryId}
              onChange={(e) => setSubcatCategoryId(Number(e.target.value))}
              required
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subcategory Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={subcatName}
              onChange={(e) => {
                setSubcatName(e.target.value);
                if (!editingSubcategory) setSubcatSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Kubernetes & Docker"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slug <span className="text-rose-500">*</span>
            </label>
            <Input
              value={subcatSlug}
              onChange={(e) => setSubcatSlug(e.target.value)}
              placeholder="kubernetes-docker"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={subcatDescription}
              onChange={(e) => setSubcatDescription(e.target.value)}
              placeholder="Brief summary of this specialization..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={subcatDisplayOrder}
                onChange={(e) => setSubcatDisplayOrder(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={subcatStatus}
                onChange={(e) => setSubcatStatus(e.target.value as TaxonomyStatus)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubcategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingSubcat}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmittingSubcat ? 'Saving...' : editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Category Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteCatTarget)}
        title="Delete Category"
        description={`Are you sure you want to delete category "${deleteCatTarget?.name}"? If there are active courses or subcategories attached, the deletion will be rejected.`}
        confirmLabel={isDeletingCat ? 'Deleting...' : 'Delete Category'}
        confirmVariant="destructive"
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCatTarget(null)}
      />

      {/* Delete Subcategory Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteSubcatTarget)}
        title="Delete Subcategory"
        description={`Are you sure you want to delete subcategory "${deleteSubcatTarget?.name}"?`}
        confirmLabel={isDeletingSubcat ? 'Deleting...' : 'Delete Subcategory'}
        confirmVariant="destructive"
        onConfirm={handleDeleteSubcategory}
        onCancel={() => setDeleteSubcatTarget(null)}
      />
    </div>
  );
}
