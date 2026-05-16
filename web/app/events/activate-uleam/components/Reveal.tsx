"use client";

import { motion, type MotionProps } from "framer-motion";

import { easeOutQuint, reveal } from "@/lib/animations";

type Props = MotionProps & {
  children: React.ReactNode;
  delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: Props) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.6, ease: easeOutQuint, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
