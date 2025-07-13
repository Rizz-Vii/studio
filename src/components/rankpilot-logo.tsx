import { motion } from "framer-motion";

export function RocketIcon() {
  return (
    <motion.svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      initial={{ y: 0 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="inline-block align-middle"
    >
      {/* ...your SVG path... */}
    </motion.svg>
  );
}