import { Loader2 } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export default function ClientLoadingState({ text = "" }) {
  return (
    <motion.div
      className="flex flex-col justify-center items-center py-24 gap-4"
      {...fadeUp()}
    >
      <Loader2 className="h-7 w-7 animate-spin text-primarygreen-500" />
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
        {text}
      </p>
    </motion.div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});
