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

const storyTags = ["Mobile-first", "Readable motion", "Warm editorial UI"];

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

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-18 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-toffeebrown/55">
            Why This Works
          </p>
          <h2 className="mt-3 text-[clamp(2.25rem,8vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.05em]">
            The landing page keeps its voice, even on a phone.
          </h2>
          <p className="mt-4 text-sm leading-7 text-toffeebrown/80 sm:text-base">
            The scroll section still has depth and movement, but it now scales with the viewport
            instead of assuming a giant desktop canvas.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
          {storyTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-toffeebrown/20 bg-rossycopper/8 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-toffeebrown/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[160vh] sm:h-[190vh] lg:h-[220vh]">
        <div className="sticky top-0 flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
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
              <p className="mx-auto max-w-3xl text-sm leading-7 text-toffeebrown/78 sm:text-base">
                A calmer mobile height, fluid widths, and responsive type keep the movement readable
                instead of overwhelming the page.
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
