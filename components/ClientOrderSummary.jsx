"use client";

import { ArrowRight, Lock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function ClientOrderSummary() {
  const subtotal = 1200;
  const discount = 120;
  const total = subtotal - discount;
  const [promo, setPromo] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border-[1.5px] border-border bg-card p-6 shadow-[0_2px_16px_hsl(var(--primarygreen-700)/0.07)]"
    >
      <h2 className="mb-5 font-bold text-xl tracking-tight text-primarygreen-700 uppercase">
        Order Summary
      </h2>

      <div className="space-y-0 divide-y divide-border">
        <div className="flex justify-between items-center py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Subtotal
          </span>
          <span className="text-sm font-semibold text-foreground">
            {subtotal.toLocaleString()} LE
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Shipping
          </span>
          <span className="text-xs text-muted-foreground italic">
            Calculated at checkout
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Discount
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Save {discount} LE
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-between items-baseline border-t-[1.5px] border-border pt-4">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-2xl font-extrabold text-primarygreen-700 tracking-tight">
          {total.toLocaleString()} LE
        </span>
      </div>

      {/* Promo code */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Promo code"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          className="flex-1 rounded-xl border-[1.5px] border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primarygreen-600 transition-colors"
        />
        <button className="rounded-xl border-[1.5px] border-border px-3.5 py-2.5 text-xs font-semibold tracking-wider text-primarygreen-700 hover:bg-primarygreen-50 hover:border-primarygreen-600 transition-colors">
          APPLY
        </button>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => console.log("checkout")}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-primarygreen-700 py-3.5 text-[15px] font-bold tracking-wide text-primarygreen-100 shadow-[0_4px_18px_hsl(var(--primarygreen-700)/0.28)] hover:bg-primarygreen-800 transition-colors"
      >
        Checkout
        <ArrowRight className="h-[18px] w-[18px]" />
      </motion.button>

      <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3 opacity-60" />
        Secure checkout · SSL encrypted
      </p>
    </motion.div>
  );
}

export default ClientOrderSummary;
