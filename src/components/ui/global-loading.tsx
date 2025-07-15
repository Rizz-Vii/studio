"use client";

import { motion } from 'framer-motion';
import { useUI } from "@/context/UIContext";

export function GlobalLoadingIndicator() {
  const { isProcessing } = useUI();

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="flex h-full items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    </motion.div>
  );
}
