"use client";

import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";

const Skiper28 = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 1], [250, 0]);
  const transform = useMotionTemplate`rotateX(30deg) translateY(${yMotionValue}px) translateZ(10px)`;

  return (
    <ReactLenis root>
      <div
        ref={targetRef}
        className="relative top-18 z-0 h-[350vh] w-screen bg-[#020800] text-black"
      >
        <div className="absolute left-1/2 top-[3%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-white">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black after:content-['']">
            scroll down
          </span>
        </div>
        <div
          className="sticky top-0 mx-auto flex justify-center items-center bg-transparent py-0"
          style={{
            transformStyle: "preserve-3d",
            perspective: "200px",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
            }}
            className="font-geist w-full max-w-4xl text-center text-6xl font-bold tracking-tighter text-[#2bff00]"
          >
            Let the world see your blogs and projects in a new way.An old-school
            developer blog style where posts stack over time.Built by developers,
            for developers — bringing back a touch of old gold.
            ...............................................................
            ..................................................................
            <div className="absolute bottom-0 left-0 h-[60vh] w-full" />
          </motion.div>
        </div>
      </div>
    </ReactLenis>
  );
};

export { Skiper28 };

/**
 * Skiper 28 PerspectiveTextScroll — React + framer motion + lenis
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
