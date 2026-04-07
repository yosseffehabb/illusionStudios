"use client";

import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});

const increase = (item) => console.log("increase", item);
const decrease = (item) => console.log("decrease", item);
const remove = (item) => console.log("remove", item);

function Page() {
  const {
    subtotal,
    cart,
    deleteItem,
    incrementQuantity,
    decrementQuantity,
    totalItems,
  } = useCart();

  console.log(cart);

  /////////////// actions/////////////////

  function handleDeleteItem({ productid, size }) {
    deleteItem(productid, size);
  }
  function handleIncItem({ productid, size }) {
    incrementQuantity(productid, size);
  }
  function handleDecItem({ productid, size }) {
    decrementQuantity(productid, size);
  }
  function handleClearCart() {}

  if (!cart.length) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div {...fadeUp()} className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-primarygreen-700" />
          </div>
          <h2 className="text-2xl font-bold text-primarygreen-700">
            Your cart is empty
          </h2>
          <p className="mt-2 text-neutral-400">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-primarygreen-700 text-primarygreen-50"
          >
            <Link href="/shop">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4 text-primarygreen-50" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-2xl sm:text-2xl font-bold text-primarygreen-500 text-center tracking-wider uppercase pt-8">
        Your Cart
      </h1>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-none sm:border sm:shadow-sm">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.product_id}-${item.size}`}
                    {...fadeUp(index * 0.08)}
                    layout
                  >
                    <div className="flex gap-2.5 p-2.5 sm:gap-4 sm:p-4 md:p-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24 md:h-28 md:w-28 md:rounded-xl">
                        <Image
                          src={item.images?.[0]?.url || "/placeholder.png"}
                          alt={item.product_name}
                          fill
                          sizes="(max-width 640px) 100vw, (max-width 1024px) 50vw, 25vw"
                          className="object-contain rounded-lg md:rounded-xl"
                          loading="lazy"
                          priority={false}
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-primarygreen-700 sm:text-sm md:text-base">
                              {item.product_name}
                            </h3>
                            <button
                              onClick={() =>
                                handleDeleteItem({
                                  productid: item.product_id,
                                  size: item.size,
                                })
                              }
                              className="shrink-0 rounded-md p-1 text-destructive transition-colors bg-destructive/10 hover:text-destructive sm:rounded-lg sm:p-1.5 hover:bg-destructive/30 duration-300"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                          <Badge
                            variant="secondary"
                            className="mt-1 text-[10px] px-1.5 py-0 sm:mt-1.5 sm:text-xs sm:px-2.5 sm:py-0.5 text-primarygreen-50 bg-primarygreen-700"
                          >
                            Size: {item.size}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center justify-between sm:mt-3">
                          <p className="text-sm font-bold text-primarygreen-700 sm:text-lg md:text-xl">
                            {(item.unit_price * item.quantity).toLocaleString()}{" "}
                            LE
                          </p>

                          <div className="flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm sm:gap-1 bg-primarygreen-700 text-primarygreen-50">
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primarygreen-100 sm:h-8 sm:w-8 hover:text-primarygreen-700 transition-all duration-300
                            "
                              onClick={() =>
                                handleDecItem({
                                  productid: item.product_id,
                                  size: item.size,
                                })
                              }
                            >
                              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>

                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-5 text-center text-xs font-semibold sm:w-8 sm:text-sm"
                            >
                              {item.quantity}
                            </motion.span>

                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primarygreen-100 sm:h-8 sm:w-8 hover:text-primarygreen-700 transition-all duration-300"
                              onClick={() =>
                                handleIncItem({
                                  productid: item.product_id,
                                  size: item.size,
                                })
                              }
                            >
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < cart.length - 1 && <Separator />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div {...fadeUp(0.2)}>
              <Card className="sticky top-6">
                <CardHeader className="px-3 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
                  <CardTitle className="text-base sm:text-2xl text-primarygreen-700 font-semibold">
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 px-3 sm:space-y-4 sm:px-6">
                  {cart.map((item) => (
                    <div
                      key={`${item.product_id}-${item.size}`}
                      className="space-y-0.5"
                    >
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground line-clamp-1 max-w-[60%]">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.unit_price * item.quantity).toLocaleString()}{" "}
                          LE
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground/60">
                        {item.unit_price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({totalItems} items)
                      </span>
                      <span className="font-medium">
                        {subtotal.toLocaleString()} LE
                      </span>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-muted-foreground">At checkout</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-primarygreen-900">
                    <span className="text-sm font-bold sm:text-base">
                      Total
                    </span>
                    <span className="text-base font-bold sm:text-xl">
                      {subtotal.toLocaleString()} LE
                    </span>
                  </div>

                  <Button
                    className="w-full py-5 text-sm font-semibold sm:py-6 sm:text-base bg-primarygreen-700 text-primarygreen-50"
                    size="lg"
                  >
                    Checkout
                    <ArrowRight className="ml-1.5 h-4 w-4 sm:ml-2 sm:h-5 sm:w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;

// const cartItems = [
//     {
//       product_id: "8d5248ef-e597-4dcd-bc55-436179402d10",
//       product_name: "Washed olive jeans",
//       product_sku: "PRD-778736",
//       product_color: "olive green",

//       size: "30",
//       sizeId: "fd537bec-7050-4710-b852-43d4881c90f2",

//       quantity: 4,
//       stock_quantity: 11,

//       unit_price: 800,
//       discount: 10,

//       images: [
//         {
//           publicId: "qy2jly99xr7xcjcdpomn",
//           url: "https://res.cloudinary.com/daczw3asf/image/upload/v1773784226/qy2jly99xr7xcjcdpomn.jpg",
//         },
//         {
//           publicId: "phxm8bxnau3iyfze1wda",
//           url: "https://res.cloudinary.com/daczw3asf/image/upload/v1773784226/phxm8bxnau3iyfze1wda.jpg",
//         },
//         {
//           publicId: "yat75z5odffosa2miygt",
//           url: "https://res.cloudinary.com/daczw3asf/image/upload/v1773784226/yat75z5odffosa2miygt.jpg",
//         },
//       ],
//     },

//     {
//       product_id: "c08d9973-18fc-455d-8b37-425fc5a77170",
//       product_name: "washed gray denim",
//       product_sku: "PRD-491101",
//       product_color: "gray",

//       size: "32",
//       // sizeId: "...",

//       quantity: 1, // (you didn’t include it but لازم تحطه)
//       stock_quantity: 10, // (guess — replace with real)

//       unit_price: 750,
//       discount: 0,

//       images: [
//         // add images here if موجودة
//       ],
//     },
//   ];
