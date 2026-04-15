import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

export default function OrderSummary({ variant = "cart", shippingFee = 0 }) {
  const router = useRouter();
  const { subtotal, cart, totalItems } = useCart();

  const isCart = variant === "cart";
  const total = isCart ? subtotal : subtotal + shippingFee;

  return (
    <div className="lg:col-span-1">
      <motion.div {...fadeUp(0.2)}>
        <Card className={isCart ? "sticky top-6" : "sticky top-32"}>
          <CardHeader className="px-3 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
            <CardTitle className="text-base sm:text-2xl text-primarygreen-700 font-semibold">
              Order Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 px-3 sm:space-y-4 sm:px-6">
            {cart.map((item) => {
              const effectivePrice = Math.round(
                item.unit_price * (1 - (item.discount || 0) / 100),
              );
              const lineTotal = effectivePrice * item.quantity;
              return (
                <div
                  key={`${item.product_id}-${item.size}`}
                  className="space-y-0.5"
                >
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground line-clamp-1 max-w-[60%]">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {lineTotal.toLocaleString()} LE
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60">
                    {effectivePrice.toLocaleString()} × {item.quantity}
                    {item.discount > 0 && (
                      <span className="ml-1 text-green-600">
                        (-{item.discount}%)
                      </span>
                    )}
                  </p>
                </div>
              );
            })}

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
                {isCart ? (
                  <span className="text-muted-foreground">At checkout</span>
                ) : (
                  <span className="font-medium">
                    {shippingFee.toFixed(2)} LE
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-primarygreen-900">
              <span className="text-sm font-bold sm:text-base">Total</span>
              <span className="text-base font-bold sm:text-xl">
                {total.toLocaleString()} LE
              </span>
            </div>

            {isCart && (
              <Button
                onClick={() => router.push("/shop/checkout")}
                disabled={cart.length === 0}
                className="w-full py-5 text-sm font-semibold sm:py-6 sm:text-base bg-primarygreen-700 text-primarygreen-50"
                size="lg"
              >
                Checkout
                <ArrowRight className="ml-1.5 h-4 w-4 sm:ml-2 sm:h-5 sm:w-5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});
