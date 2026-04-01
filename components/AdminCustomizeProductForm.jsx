"use client";

import { useState, useRef } from "react";
import {
  useDeleteProduct,
  useProductById,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useEffect } from "react";
import {
  CirclePlus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { Spinner } from "./ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCategories } from "@/hooks/useCategories";
import { PRODUCT_SIZE_TYPE, PRODUCT_STATUS } from "@/lib/constants";

export default function AdminCustomizeProductForm({ productId }) {
  const { data: product, isLoading, error } = useProductById(productId);
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: isCategoriesError,
  } = useCategories();

  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);
  const replaceInputRef = useRef(null);

  function handleDelete(id) {
    deleteProductMutation.mutate(id);
  }

  // Sync existing images when product loads (deferred to avoid cascading renders)
  useEffect(() => {
    const images = product?.images?.length ? [...product.images] : [];
    const timer = setTimeout(() => {
      setExistingImages(images);
      setNewFiles([]);
      setNewPreviewUrls([]);
    }, 0);
    return () => clearTimeout(timer);
  }, [product?.id, product?.images]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;
    const urls = validFiles.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviewUrls((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviewUrls[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceExistingImage = (index) => {
    replaceInputRef.current?.setAttribute("data-replace-index", String(index));
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = (e) => {
    const replaceIndex =
      replaceInputRef.current?.getAttribute("data-replace-index");
    if (replaceIndex == null) return;
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;
    const file = validFiles[0];
    const previewUrl = URL.createObjectURL(file);
    setExistingImages((prev) =>
      prev.filter((_, i) => i !== parseInt(replaceIndex, 10)),
    );
    setNewFiles((prev) => [...prev, file]);
    setNewPreviewUrls((prev) => [...prev, previewUrl]);
    replaceInputRef.current?.removeAttribute("data-replace-index");
    e.target.value = "";
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
      color: "",
      category_id: "",
      size_type: "",
      status: "",
      variants: [],
      images: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product) {
      const categoryId = product.category_id ?? product.category?.id ?? "";
      const sizeType = product.size_type ?? "";
      const status = product.status ?? "";
      reset({
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price ?? 0,
        discount: product.discount ?? 0,
        color: product.color ?? "",
        category_id: String(categoryId),
        size_type: String(sizeType),
        status: String(status),
        variants: Array.isArray(product.variants)
          ? product.variants.map((v) => ({
              size: v.size ?? "",
              stock: v.stock ?? 0,
            }))
          : [],
        images: product.images ?? [],
      });
    }
  }, [product, reset]);

  async function onSubmit(formData) {
    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) {
      alert("Please upload at least one product image");
      return;
    }
    try {
      await updateProductMutation.mutateAsync({
        productId,
        formData,
        existingImageUrls: existingImages,
        newImageFiles: newFiles,
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  const isSubmitting = updateProductMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primarygreen-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading product</p>
          <p className="text-neutral-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-600">Product not found</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="name" className="text-neutral-700">
              Product Name *
            </Label>
            <Input
              id="name"
              placeholder="Washed Olive Denim"
              className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="color" className="text-neutral-700">
              Product Color *
            </Label>
            <Input
              id="color"
              placeholder="olive green"
              className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
              {...register("color", { required: "Product color is required" })}
            />
            {errors.color && (
              <span className="text-xs text-red-500">
                {errors.color.message}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 w-full">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Premium washed olive denim jeans..."
            className="px-4 py-2 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <span className="text-xs text-red-500">
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Price & Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="price" className="text-neutral-700">
              Price (EGP) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="800"
              className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" },
                valueAsNumber: true,
              })}
            />
            {errors.price && (
              <span className="text-xs text-red-500">
                {errors.price.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="discount" className="text-neutral-700">
              Discount (%) *
            </Label>
            <Input
              id="discount"
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="0"
              className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
              {...register("discount", {
                min: { value: 0, message: "Discount cannot be negative" },
                max: { value: 100, message: "Discount cannot exceed 100%" },
                valueAsNumber: true,
              })}
            />
            {errors.discount && (
              <span className="text-xs text-red-500">
                {errors.discount.message}
              </span>
            )}
          </div>
        </div>
        {/* Category, Size Type, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="category_id" className="text-neutral-700">
              Category *
            </Label>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value || "")}
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primarygreen-500 bg-primarygreen-50 placeholder:text-neutral-400 transition-all duration-300"
                    suppressHydrationWarning
                  >
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && (
              <span className="text-xs text-red-500">
                {errors.category_id.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="size_type" className="text-neutral-700">
              Size Type *
            </Label>
            <Controller
              name="size_type"
              control={control}
              rules={{ required: "Size type is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value || "")}
                >
                  <SelectTrigger
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primarygreen-500 bg-primarygreen-50 placeholder:text-neutral-400 transition-all duration-300"
                    suppressHydrationWarning
                  >
                    <SelectValue placeholder="Select Size Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_SIZE_TYPE.map((pst) => (
                      <SelectItem key={pst} value={pst}>
                        {pst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.size_type && (
              <span className="text-xs text-red-500">
                {errors.size_type.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="status" className="text-neutral-700">
              Product Status *
            </Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value || "")}
                >
                  <SelectTrigger
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primarygreen-500 bg-primarygreen-50 placeholder:text-neutral-400 transition-all duration-300"
                    suppressHydrationWarning
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUS.map((ps) => (
                      <SelectItem key={ps} value={ps}>
                        {ps}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <span className="text-xs text-red-500">
                {errors.status.message}
              </span>
            )}
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-primarygreen-50 rounded-lg p-6 shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-xl font-semibold text-primarygreen-500">
              Product Images *
            </h2>
            <div className="flex gap-2">
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceFileChange}
                className="hidden"
              />
              <Label
                htmlFor="image-upload-customize"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primarygreen-500 text-white rounded-lg hover:bg-primarygreen-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </Label>
              <Input
                id="image-upload-customize"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {existingImages.length === 0 && newPreviewUrls.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No images uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click &quot;Upload Images&quot; to add product photos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                >
                  <Image
                    src={url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => replaceExistingImage(index)}
                      className="p-2 bg-white text-primarygreen-600 rounded-full hover:bg-primarygreen-50 transition-colors"
                      title="Replace image"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {newPreviewUrls.map((url, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                >
                  <Image
                    src={url}
                    alt={`New ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            {existingImages.length + newFiles.length} image(s) total · Hover
            over images to replace or remove
          </p>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg p-6 shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-xl font-semibold text-primarygreen-500">
              Sizes & Stock
            </h2>
            <Button
              type="button"
              onClick={() => append({ size: "", stock: 0 })}
              size="sm"
              className="bg-primarygreen-500 hover:bg-primarygreen-700"
            >
              <CirclePlus className="w-4 h-4 mr-2" />
              Add Size
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <Input
                  {...register(`variants.${index}.size`, {
                    required: "Size is required",
                  })}
                  placeholder="30"
                  className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
                />
                {errors.variants?.[index]?.size && (
                  <span className="text-xs text-red-500">
                    {errors.variants[index].size.message}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  {...register(`variants.${index}.stock`, {
                    required: "Stock is required",
                    min: { value: 0, message: "Stock must be 0 or more" },
                  })}
                  placeholder="Stock: 10"
                  className="h-10 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
                />
                {errors.variants?.[index]?.stock && (
                  <span className="text-xs text-red-500">
                    {errors.variants[index].stock.message}
                  </span>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="destructive"
                  size="sm"
                  className="h-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primarygreen-500 hover:bg-primarygreen-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                {newFiles.length > 0
                  ? "Uploading & Saving..."
                  : "Saving Changes..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleDelete(productId)}
            disabled={isSubmitting || deleteProductMutation.isPending}
          >
            Delete Product
          </Button>
        </div>

        {updateProductMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {updateProductMutation.error?.message ||
                "Failed to update product"}
            </p>
          </div>
        )}
      </form>
    </>
  );
}
