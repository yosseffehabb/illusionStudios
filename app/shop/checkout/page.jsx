"use client";

import { useCart } from "@/contexts/CartContext";
import { GOVERNORATES } from "@/lib/constants";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const { cart, subtotal } = useCart();
  const selectedGovernorate = watch("governorate");
  const shippingFee =
    GOVERNORATES.find((g) => g.name === selectedGovernorate)?.shipping_fee || 0;
  const total = (subtotal || 0) + shippingFee;

  async function onSubmit(data) {
    const address = `${data.street}, ${data.city}, ${data.governorate}`;
    const normalizedPhone = `+20${data.phone}`;

    const orderPayload = {
      customer_name: `${data.firstName} ${data.lastName}`,
      customer_phone: normalizedPhone,
      customer_address: address,
      notes: data.notes || null,
      cart,
    };

    console.log("Order payload:", orderPayload);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <h1 className="text-2xl sm:text-2xl font-bold text-primarygreen-500 text-center tracking-wider uppercase pt-8">
        Checkout
      </h1>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ahmed"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      className={`rounded-lg focus-visible:ring-primarygreen-500 ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Hassan"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className={`rounded-lg focus-visible:ring-primarygreen-500 ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-primarygreen-500">
                    <span className="px-3 text-sm font-medium text-foreground border-r border-border">
                      +20
                    </span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="1012345678"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^1[0125][0-9]{8}$/,
                          message:
                            "Enter a valid Egyptian mobile number (10 digits after +20)",
                        },
                      })}
                      className={`rounded-l-none border-0 focus-visible:ring-0 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.phone.message}
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Governorate <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("governorate", {
                        required: "Governorate is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primarygreen-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">Select a governorate</option>
                      {GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.name}>
                          {gov.name}
                        </option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.governorate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Cairo"
                      {...register("city", { required: "City is required" })}
                      className={`rounded-lg focus-visible:ring-primarygreen-500 ${
                        errors.city ? "border-red-500" : ""
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="123 Tahrir St, Apartment 4B"
                    {...register("street", {
                      required: "Street address is required",
                    })}
                    className={`rounded-lg focus-visible:ring-primarygreen-500 ${
                      errors.street ? "border-red-500" : ""
                    }`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Delivery Notes
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Any special instructions for delivery..."
                    {...register("notes")}
                    className="resize-none rounded-lg focus-visible:ring-primarygreen-500"
                  />
                </div>
              </section>

              {/* Form Actions */}
              <div className="flex gap-3 justify-between lg:justify-end">
                <Button
                  type="button"
                  onClick={() => reset()}
                  variant="outline"
                  className="px-6 py-2.5 rounded-lg focus-visible:ring-primarygreen-500"
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-lg bg-primarygreen-700 hover:bg-primarygreen-900 text-white font-medium disabled:opacity-50 focus-visible:ring-primarygreen-500"
                >
                  {isSubmitting ? "Placing order..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-sm border border-border p-8 sticky top-32">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 pb-6 border-b border-border">
                {cart && cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div>
                        <p className="text-foreground font-medium">
                          {item.product_name}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          Qty: {item.quantity} × {item.size}
                        </p>
                      </div>
                      <p className="text-foreground font-medium">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 text-sm">No items in cart</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-foreground font-medium">
                    ${(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Shipping</span>
                  <span className="text-foreground font-medium">
                    ${shippingFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-xl font-bold text-primarygreen-700">
                    {total.toFixed(2)} LE
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 space-y-3 text-center text-xs text-neutral-400">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure Checkout
                </div>
                <p>30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
