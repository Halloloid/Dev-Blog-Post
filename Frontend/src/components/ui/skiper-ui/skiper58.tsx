"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    label: "Featured",
    index: "01",
    cta: "Open Feed",
    kind: "route",
    variant: "featured",
    className:
      "col-span-2 border-black/10 bg-eggshell text-rossycopper shadow-[0_20px_50px_rgba(92,38,24,0.14)] ",
    titleClassName: "text-[clamp(2.15rem,9vw,3.7rem)] text-rossycopper",
    copyClassName: "text-rossycopper/82",
    pillClassName: "border-rossycopper/12 bg-rossycopper/8 text-rossycopper/58",
  },
  {
    name: "Reviews",
    href: "#reviews",
    label: "Section",
    index: "02",
    cta: "View Cards",
    kind: "anchor",
    variant: "compact",
    className: "bg-eggshell/10 text-eggshell",
    titleClassName: "text-[1.45rem] sm:text-[1.75rem] text-eggshell",
    copyClassName: "text-eggshell/74",
    pillClassName: "border-eggshell/16 bg-eggshell/8 text-eggshell/52",
  },
  {
    name: "Story",
    href: "#story",
    label: "Section",
    index: "03",
    cta: "Read Story",
    kind: "anchor",
    variant: "compact",
    className: "bg-black/12 text-eggshell",
    titleClassName: "text-[1.45rem] sm:text-[1.75rem] text-eggshell",
    copyClassName: "text-eggshell/74",
    pillClassName: "border-eggshell/16 bg-eggshell/8 text-eggshell/52",
  },
  {
    name: "Creator",
    href: "https://github.com/Halloloid",
    label: "Profile",
    index: "04",
    cta: "Visit GitHub",
    kind: "external",
    variant: "wide",
    className: "col-span-2 bg-eggshell/12 text-eggshell",
    titleClassName: "text-[1.6rem] sm:text-[1.95rem] text-eggshell",
    copyClassName: "text-eggshell/74",
    pillClassName: "border-eggshell/16 bg-eggshell/8 text-eggshell/52",
  },
  {
    name: "Login",
    href: "https://dev-blog-post.onrender.com/auth/google",
    label: "Action",
    index: "05",
    cta: "Start Posting",
    kind: "external",
    variant: "wide",
    className: "col-span-2 border-eggshell/25 bg-black/16 text-eggshell",
    titleClassName: "text-[1.6rem] sm:text-[1.95rem] text-eggshell",
    copyClassName: "text-eggshell/78",
    pillClassName: "border-eggshell/16 bg-eggshell/8 text-eggshell/52",
  },
] as const;

const BentoCard = ({
  item,
}: {
  item: (typeof navigationItems)[number];
}) => {
  const isFeatured = item.variant === "featured";
  const isCompact = item.variant === "compact";
  const isWide = item.variant === "wide";

  const cardClassName = cn(
    "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[1.6rem] border p-4 transition-transform duration-300 hover:-translate-y-0.5 sm:p-5",
    isFeatured && "min-h-[10rem] md:min-h-[11rem]",
    isCompact && "min-h-[9rem] md:min-h-[10rem]",
    isWide && "min-h-[9rem] md:min-h-[10.5rem]",
    item.className,
  );

  const content = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,242,220,0.16),transparent_34%)] opacity-70" />

      <div className="relative flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
            item.pillClassName,
          )}
        >
          {item.label}
        </span>
        <span className={cn("text-[0.68rem] font-semibold uppercase tracking-[0.14em]", item.copyClassName)}>
          {item.index}
        </span>
      </div>

      <div className={cn("relative mt-5 min-w-0", isFeatured ? "sm:max-w-[34rem]" : "sm:max-w-[30ch]")}>
        <TextRoll
          className={cn(
            "max-w-full text-balance font-black uppercase leading-[0.94] tracking-[-0.045em]",
            item.titleClassName,
          )}
        >
          {item.name}
        </TextRoll>
        <p className={cn("mt-3 text-[0.74rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.78rem]", item.copyClassName)}>
          {item.cta}
        </p>
      </div>
    </>
  );

  return item.kind === "route" ? (
    <Link to={item.href} className={cardClassName}>
      {content}
    </Link>
  ) : (
    <a
      href={item.href}
      target={item.kind === "external" ? "_blank" : undefined}
      rel={item.kind === "external" ? "noreferrer noopener" : undefined}
      className={cardClassName}
    >
      {content}
    </a>
  );
};

export const Skiper58 = () => {
  return (
    <nav className="overflow-hidden rounded-[2rem] border border-eggshell/20 bg-black/10 p-5 text-eggshell shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-6">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-eggshell/60 sm:tracking-[0.34em]">
          Explore
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {navigationItems.map((item) => (
          <BentoCard key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
};

const STAGGER = 0.035;

export const TextRoll = ({
  children,
  className,
  center = false,
}: {
  children: string;
  className?: string;
  center?: boolean;
}) => {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden", className)}
      style={{ lineHeight: 0.9 }}
    >
      <div>
        {children.split("").map((character, index) => {
          const delay = center
            ? STAGGER * Math.abs(index - (children.length - 1) / 2)
            : STAGGER * index;

          return (
            <motion.span
              key={`${character}-${index}-front`}
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{ ease: "easeInOut", delay }}
              className="inline-block"
            >
              {character === " " ? "\u00A0" : character}
            </motion.span>
          );
        })}
      </div>

      <div className="absolute inset-0">
        {children.split("").map((character, index) => {
          const delay = center
            ? STAGGER * Math.abs(index - (children.length - 1) / 2)
            : STAGGER * index;

          return (
            <motion.span
              key={`${character}-${index}-back`}
              variants={{
                initial: { y: "100%" },
                hovered: { y: 0 },
              }}
              transition={{ ease: "easeInOut", delay }}
              className="inline-block"
            >
              {character === " " ? "\u00A0" : character}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
};
