import { useState, useRef, useEffect } from "react";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShineBorder } from "./ui/shine-border";

const SAMPLE_ITEMS = [
  "React Patterns",
  "TypeScript Tips",
  "Tailwind Tricks",
  "Next.js Builds",
  "Node APIs",
  "GraphQL Notes",
  "PostgreSQL Queries",
  "Docker Setup",
  "Kubernetes Scaling",
  "Redis Caching",
  "Python Workflows",
  "AI Tooling",
  "Frontend Systems",
  "Mobile Shipping",
  "Cloud Deployments",
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

const SearchBar = ({ value, onChange, onSubmit }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.length > 0
    ? SAMPLE_ITEMS.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const showDropdown = isFocused && filtered.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (submittedValue: string) => {
    onSubmit(submittedValue);
    setIsFocused(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl">
      <form
        className="relative overflow-hidden rounded-[1.6rem] border border-eggshell/20 bg-eggshell/12 p-1.5 backdrop-blur-sm sm:p-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(value.trim());
        }}
      >
        <ShineBorder
          borderWidth={1.2}
          duration={12}
          shineColor={["var(--color-lightbronze)", "var(--color-skyreflection)", "var(--color-eggshell)"]}
          className="opacity-70"
        />

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.15rem] bg-eggshell px-4 py-3 text-toffeebrown">
            <Search className="size-4 shrink-0 text-rossycopper sm:size-5" />
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search posts, stacks, or topics"
              className="min-w-0 flex-1 bg-transparent text-sm text-toffeebrown outline-none placeholder:text-toffeebrown/45 sm:text-base"
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsFocused(false);
                }}
                className="inline-flex size-8 items-center justify-center rounded-full border border-toffeebrown/10 text-toffeebrown/58 transition-colors hover:border-rossycopper/30 hover:text-rossycopper"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-eggshell/14 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-eggshell transition-colors hover:bg-lightbronze hover:text-toffeebrown sm:w-auto sm:px-5"
          >
            Search
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="relative z-10 mt-3 overflow-hidden rounded-[1.5rem] border border-toffeebrown/12 bg-eggshell shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-2 border-b border-toffeebrown/10 px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-toffeebrown/55">
            <Sparkles className="size-3.5 text-rossycopper" />
            Suggested Topics
          </div>

          <ul className="space-y-1 p-2">
            {filtered.slice(0, 6).map((item, index) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item);
                    handleSubmit(item);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[1rem] px-3 py-3 text-left text-sm text-toffeebrown transition-colors",
                    index % 2 === 0 ? "hover:bg-lightbronze/20" : "hover:bg-skyreflection/16"
                  )}
                >
                  <span>{item}</span>
                  <ArrowRight className="size-4 text-toffeebrown/45" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
