"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    description: "[0]",
    kind: "route",
  },
  {
    name: "Reviews",
    href: "#reviews",
    description: "[1]",
    kind: "anchor",
  },
  {
    name: "Story",
    href: "#story",
    description: "[2]",
    kind: "anchor",
  },
  {
    name: "Creator",
    href: "https://github.com/Halloloid",
    description: "[3]",
    kind: "external",
  },
  {
    name: "Login",
    href: "https://dev-blog-post.onrender.com/auth/google",
    description: "[4]",
    kind: "external",
  },
] as const;

export const Skiper58 = () => {
  return (
    <nav className="rounded-[2rem] border border-eggshell/20 bg-black/10 p-5 text-eggshell shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-6">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-eggshell/60">
          Explore
        </p>
        <p className="max-w-sm text-sm leading-6 text-eggshell/75">
          Quick entry points for the landing page, the blog feed, and the creator link.
        </p>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-2">
        {navigationItems.map((item, index) => (
          <li className="relative flex flex-col overflow-visible" key={index}>
            {item.kind === "route" ? (
              <Link
                to={item.href}
                className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-eggshell/12 bg-eggshell/8 px-4 py-4 transition-colors hover:border-eggshell/30 hover:bg-eggshell/12 sm:px-5"
              >
                <TextRoll
                  center
                  className="text-[clamp(2rem,9vw,4.1rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.05em] text-eggshell transition-colors"
                >
                  {item.name}
                </TextRoll>
                <span className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-eggshell/50 sm:text-xs">
                  {item.description}
                </span>
              </Link>
            ) : (
              <a
                href={item.href}
                target={item.kind === "external" ? "_blank" : undefined}
                rel={item.kind === "external" ? "noreferrer noopener" : undefined}
                className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-eggshell/12 bg-eggshell/8 px-4 py-4 transition-colors hover:border-eggshell/30 hover:bg-eggshell/12 sm:px-5"
              >
                <TextRoll
                  center
                  className="text-[clamp(2rem,9vw,4.1rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.05em] text-eggshell transition-colors"
                >
                  {item.name}
                </TextRoll>
                <span className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-eggshell/50 sm:text-xs">
                  {item.description}
                </span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const STAGGER = 0.035;

const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden", className)}
      style={{
        lineHeight: 0.82,
      }}
    >
      <div>
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: {
                  y: 0,
                },
                hovered: {
                  y: "-100%",
                },
              }}
              transition={{
                ease: "easeInOut",
                delay,
              }}
              className="inline-block"
              key={i}
            >
              {l}
            </motion.span>
          );
        })}
      </div>
      <div className="absolute inset-0">
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: {
                  y: "100%",
                },
                hovered: {
                  y: 0,
                },
              }}
              transition={{
                ease: "easeInOut",
                delay,
              }}
              className="inline-block"
              key={i}
            >
              {l}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
};

export { TextRoll };
