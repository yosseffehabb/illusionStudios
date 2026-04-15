"use client";
import { Controller, useForm } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { usePlaceOrder } from "@/hooks/useOrdres";
import { useCart } from "@/contexts/CartContext";
import { GOVERNORATES } from "@/lib/constants";
import OrderSummary from "@/components/ClientOrderSummary";

export default function ClientCheckoutForm() {
  const router = useRouter();
  const defaultValues = {
    first_name: "",
    last_name: "",
    customer_phone: "",
    governorate: "",
    city: "",
    street: "",
    notes: "",
  };
  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({ defaultValues });
  const { mutateAsync: placeOrderMutation, isPending } = usePlaceOrder();
  const { cart, clearCart } = useCart();
  const selectedGovernorate = watch("governorate");
  const shippingFee =
    GOVERNORATES.find((g) => g.name === selectedGovernorate)?.shipping_fee || 0;

  async function onSubmit(data) {
    const address = `${data.street}, ${data.city}, ${data.governorate}`;
    const normalizedPhone = `+20${data.customer_phone}`;
    const fullname = `${data.first_name} ${data.last_name}`;

    const mappedItems = cart.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_color: item.product_color,
      product_sku: item.product_sku,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
    }));

    const orderData = {
      customer_name: fullname,
      customer_phone: normalizedPhone,
      customer_address: address,
      notes: data.notes,
      shipping_fee: shippingFee,
      items: mappedItems,
    };
    await placeOrderMutation(orderData);
    reset(defaultValues);
    clearCart();
    router.push("/");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Contact Information */}
          <section className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primarygreen-700 text-white text-sm font-semibold">
                1
              </div>
              <h2 className="text-xl font-semibold text-foreground ml-4">
                Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="first_name"
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
                >
                  first name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="first name"
                  className={`h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 ${errors.first_name ? "border-red-500" : ""}`}
                  {...register("first_name", {
                    required: "first name is required",
                  })}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="last_name"
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="last name"
                  className={`h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 ${errors.last_name ? "border-red-500" : ""}`}
                  {...register("last_name", {
                    required: "last name is required",
                  })}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Label
                htmlFor="customer_phone"
                className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-primarygreen-500">
                <span className="px-3 text-sm font-medium border-r border-border text-primarygreen-700">
                  +20
                </span>
                <Input
                  id="customer_phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="ex : 12 xxxxxxx"
                  {...register("customer_phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^1[0125][0-9]{8}$/,
                      message:
                        "Enter a valid Egyptian mobile number (10 digits after +20)",
                    },
                  })}
                  className={`h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 ${errors.customer_phone ? "border-red-500" : ""}`}
                />
              </div>
              {errors.customer_phone && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.customer_phone.message}
                </p>
              )}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primarygreen-700 text-white text-sm font-semibold">
                2
              </div>
              <h2 className="text-xl font-semibold text-foreground ml-4">
                Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="governorate"
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
                >
                  Governorate <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="governorate"
                  control={control}
                  rules={{ required: "Governorate is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={`w-full !h-11 sm:!h-12 px-4 text-sm bg-primarygreen-50 border border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 rounded-md ${
                          errors.governorate ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select a governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOVERNORATES.map((gov) => (
                          <SelectItem
                            key={gov.id}
                            value={gov.name}
                            className="focus:bg-primarygreen-50 focus:text-primarygreen-900"
                          >
                            {gov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.governorate && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.governorate.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="city"
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
                >
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="maadi"
                  {...register("city", { required: "City is required" })}
                  className={`h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 ${errors.city ? "border-red-500" : ""}`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Label
                htmlFor="Street"
                className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
              >
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="Street"
                placeholder="123 Tahrir St, Apartment 4B"
                {...register("street", {
                  required: "Street address is required",
                })}
                className={`h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 ${errors.street ? "border-red-500" : ""}`}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <Label
                htmlFor="notes"
                className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500 pb-2"
              >
                Delivery Notes
              </Label>
              <Textarea
                rows={3}
                placeholder="Any special instructions for delivery..."
                {...register("notes")}
                className="resize-none h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex gap-3 justify-between lg:justify-end">
            <Button
              type="button"
              onClick={() => reset(defaultValues)}
              variant="outline"
              className="px-6 py-2.5 rounded-lg focus-visible:ring-primarygreen-500"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="px-8 py-2.5 rounded-lg bg-primarygreen-700 hover:bg-primarygreen-900 text-white font-medium disabled:opacity-50 focus-visible:ring-primarygreen-500"
            >
              {isSubmitting || isPending ? "Placing order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </div>

      <OrderSummary variant="checkout" shippingFee={shippingFee} />
    </div>
  );
}
