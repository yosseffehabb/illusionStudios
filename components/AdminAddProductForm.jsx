"use client";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useAddProduct } from "@/hooks/useProducts";
import { PRODUCT_SIZE_TYPE, PRODUCT_STATUS } from "@/lib/constants";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  CirclePlus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Spinner } from "./ui/spinner";

export default function AdminAddProductForm() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: isCategoriesError,
  } = useCategories();

  const addProductMutation = useAddProduct();

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
      variants: [{ size: "", stock: 0 }],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        console.warn(`${file.name} is not an image`);
      }
      return isImage;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Remove image
  const removeImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(formData) {
    try {
      // Validate at least one image
      if (selectedFiles.length === 0) {
        alert("Please upload at least one product image");
        return;
      }

      // Convert string values to numbers
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount),
        variants: formData.variants.map((v) => ({
          size: v.size,
          stock: parseInt(v.stock),
        })),
      };

      await addProductMutation.mutateAsync({
        productData: processedData,
        imageFiles: selectedFiles,
      });

      // Reset form on success
      reset();
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  const isSubmitting = addProductMutation.isPending;

  return (
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
            {...register("name", {
              required: "Product name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
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
            {...register("color", { required: "Color is required" })}
          />
          {errors.color && (
            <span className="text-xs text-red-500">{errors.color.message}</span>
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
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters",
            },
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
            })}
          />
          {errors.price && (
            <span className="text-xs text-red-500">{errors.price.message}</span>
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
              required: "Discount is required",
              min: { value: 0, message: "Discount must be 0 or more" },
              max: { value: 100, message: "Discount cannot exceed 100%" },
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
                value={field.value}
                disabled={isCategoriesLoading}
              >
                <SelectTrigger
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primarygreen-500 bg-primarygreen-50 placeholder:text-neutral-400 transition-all duration-300"
                  suppressHydrationWarning
                >
                  <SelectValue
                    placeholder={
                      isCategoriesLoading ? "Loading..." : "Select Category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
        <div className="flex justify-between items-center ">
          <h2 className="text-sm sm:text-xl font-semibold text-primarygreen-500">
            Product Images *
          </h2>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primarygreen-500 text-white rounded-lg hover:bg-primarygreen-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Images
          </Label>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {previewUrls.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No images uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click &quot;Upload Images&quot; to add product photos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          {selectedFiles.length} image(s) selected
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

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primarygreen-500 hover:bg-primarygreen-600 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              {selectedFiles.length > 0
                ? "Uploading & Creating..."
                : "Creating Product..."}
            </>
          ) : (
            "Add Product"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setSelectedFiles([]);
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
            setPreviewUrls([]);
          }}
          disabled={isSubmitting}
        >
          Reset
        </Button>
      </div>

      {/* Error Display */}
      {addProductMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            {addProductMutation.error?.message || "Failed to create product"}
          </p>
        </div>
      )}
    </form>
  );
}
