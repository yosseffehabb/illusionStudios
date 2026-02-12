"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  AlertCircle,
  CirclePlus,
  Search,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import {
  useCategories,
  useAddCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";

export default function AdminCategoriesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  // Fetch categories using the hook
  const { data: categories = [], isLoading, error } = useCategories();

  // Mutations
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [categories, searchQuery]);

  // Handle delete category
  const handleDelete = async (category) => {
    if (category.productCount > 0) {
      setDeleteError(
        `Cannot delete category. ${category.productCount} product(s) are using it.`,
      );
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      setDeleteError(null);
    } catch (error) {
      // Error is handled by the mutation hook (toast)
      // But we can also set a local error if needed
      if (error.message?.includes("Cannot delete")) {
        setDeleteError(error.message);
      }
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setFormData({ name: "", slug: "" });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      return;
    }

    try {
      await addCategoryMutation.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
      });
      setIsFormOpen(false);
      setFormData({ name: "", slug: "" });
    } catch (error) {
      // Error is handled by the mutation hook (toast)
      console.error("Error adding category:", error);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setFormData({ name: "", slug: "" });
  };

  const handleClearDeleteError = () => {
    setDeleteError(null);
  };

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ name, slug });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold text-sm">Failed to load categories</p>
        <p className="text-sm">{error.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Error Alert */}
      {deleteError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Cannot Delete Category</p>
            <p className="text-sm">{deleteError}</p>
          </div>
          <button
            onClick={handleClearDeleteError}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primarygreen-500" />
          <Input
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 w-full placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primarygreen-500 focus:border-primarygreen-500 focus-visible:ring-2 focus-visible:ring-primarygreen-500 focus-visible:ring-offset-0 bg-primarygreen-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Add Category Button */}
        <Button
          onClick={handleAddClick}
          className="w-full sm:w-[180px] h-10 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 transition-all duration-300"
        >
          Add Category <CirclePlus />
        </Button>
      </div>

      {/* Add Category Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-primarygreen-500">
              Add New Category
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label className="text-primarygreen-500" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Category name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="mt-1 bg-primarygreen-50 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <Label className="text-primarygreen-500" htmlFor="slug">
                  Slug
                </Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="category-slug"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="mt-1 bg-primarygreen-50 placeholder:text-neutral-400"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  className="bg-primarygreen-50 text-primarygreen-500 shadow-md border"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700"
                >
                  {addCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="relative rounded-xl border border-neutral-400 p-4 hover:shadow-md transition bg-primarygreen-50"
          >
            {/* Delete Button */}
            <button
              onClick={() => handleDelete(category)}
              disabled={
                category.productCount > 0 || deleteCategoryMutation.isPending
              }
              className={`absolute top-2 right-2 p-1.5 rounded transition-colors ${
                category.productCount > 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-50 disabled:opacity-50"
              }`}
              title={
                category.productCount > 0
                  ? `Cannot delete - ${category.productCount} product(s) using it`
                  : "Delete category"
              }
            >
              {deleteCategoryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>

            {/* Category Info */}
            <h3 className="font-semibold text-primarygreen-500 pr-8">
              {category.name}
            </h3>
            <p className="text-xs text-neutral-400">/{category.slug}</p>

            {/* Product Count */}
            <p className="text-xs text-neutral-500 mt-2">
              {category.productCount || 0} product(s)
            </p>
          </div>
        ))}
      </div>

      {filteredCategories.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center sm:text-left">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      )}
    </div>
  );
}
