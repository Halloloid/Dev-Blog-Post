"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

const storyLines = [
  "Show your posts, launches, and experiments without squeezing them into a generic template.",
  "Let each update feel handcrafted, readable, and easy to browse on any screen.",
];

const Skiper28 = () => {
  const targetRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 1], [140, -30]);
  const rotation = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const transform =
    useMotionTemplate`perspective(1200px) rotateX(${rotation}deg) translateY(${yMotionValue}px) scale(${scale})`;

  return (
    <section
      id="story"
      ref={targetRef}
      className="relative overflow-hidden bg-eggshell text-toffeebrown"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(205,70,49,0.12),transparent_36%),linear-gradient(180deg,rgba(248,242,220,1)_0%,rgba(248,242,220,0.96)_100%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-toffeebrown/55 sm:tracking-[0.34em]">
            scroll
          </p>
          <h2 className="mt-3 text-[clamp(1.9rem,9vw,5rem)] font-black uppercase leading-[0.94] tracking-[-0.035em] sm:leading-[0.9] sm:tracking-[-0.05em]">
            Scroll down
          </h2>
        </div>
      </div>

      <div className="relative block h-[75vh] lg:h-[150vh]">
        <div className="sticky top-0 flex min-h-[70vh] sm:min-h-[75vh] items-center px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            style={{
              transform,
              transformStyle: "preserve-3d",
            }}
            className="mx-auto w-full max-w-5xl rounded-[2rem] border border-toffeebrown/15 bg-rossycopper/10 p-6 text-center shadow-[0_30px_80px_rgba(158,98,64,0.12)] sm:p-8 lg:p-12"
          >
            <div className="space-y-5">
              <p className="text-[clamp(2rem,7vw,5rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-balance">
                {storyLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { Skiper28 };

/**
 * Skiper 28 PerspectiveTextScroll - React + framer motion
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
