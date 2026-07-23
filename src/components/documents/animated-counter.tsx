"use client";

import * as React from "react";
import { animate } from "framer-motion";

export function AnimatedCounter({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const [display, setDisplay] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  const rounded = Math.round(display);
  return <span ref={ref}>{formatter ? formatter(rounded) : rounded.toLocaleString()}</span>;
}
