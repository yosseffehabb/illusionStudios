import { AlertCircle } from "lucide-react";
import React from "react";
import { GoBack } from "./GoBackButton";
import { motion } from "framer-motion";

export default function ClientErrorState({
  errorHeading = "Error",
  errorBody = "An error occurred",
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-7"
      {...fadeUp()}
    >
      <motion.div
        {...fadeUp()}
        className="mx-auto max-w-md mt-16 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">{errorHeading}</p>
          <p className="text-sm opacity-80 mt-0.5">{errorBody}</p>
        </div>
      </motion.div>
      <GoBack />
    </motion.div>
  );
}
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});
