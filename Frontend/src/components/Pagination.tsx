import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage?: number;
  totalPage?: number;
  onHandleNext?: () => void;
  onHandlePrevious?: () => void;
}

export function Pagination({ currentPage = 1, totalPage = 12, onHandleNext, onHandlePrevious }: PaginationProps) {
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPage;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onHandlePrevious?.()}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors",
          isFirst
            ? "cursor-not-allowed border-toffeebrown/10 bg-eggshell/55 text-toffeebrown/30"
            : "border-toffeebrown/15 bg-eggshell/80 text-toffeebrown hover:border-rossycopper/30 hover:bg-lightbronze/18"
        )}
      >
        <ChevronLeft className="size-4" />
        Prev
      </button>

      <div className="inline-flex items-center gap-3 rounded-full border border-toffeebrown/15 bg-eggshell/80 px-3 py-2 text-sm text-toffeebrown shadow-sm">
        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-rossycopper px-3 py-2 text-sm font-bold text-eggshell">
          {currentPage}
        </span>
        <span className="text-toffeebrown/40">of</span>
        <span className="inline-flex min-w-10 items-center justify-center rounded-full border border-skyreflection/35 bg-skyreflection/16 px-3 py-2 font-semibold text-toffeebrown">
          {totalPage}
        </span>
      </div>

      <button
        type="button"
        disabled={isLast}
        onClick={() => onHandleNext?.()}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors",
          isLast
            ? "cursor-not-allowed border-toffeebrown/10 bg-eggshell/55 text-toffeebrown/30"
            : "border-rossycopper/18 bg-rossycopper text-eggshell hover:bg-toffeebrown"
        )}
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
