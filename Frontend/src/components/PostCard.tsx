import { type ReactNode } from "react";
import { ArrowUpRight, Calendar, Eye, MessageCircle, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Post {
  id: string;
  title: string | null;
  created_at: string;
  featured_img: string | null;
  likes_count: number;
  view_count: number;
  comments_count: number;
  exceprt: string | null;
  status: 'draft' | 'published' | string;
}

interface PostCardProps {
  post: Post;
  onClick?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

function StatPill({
  icon,
  value,
  accentClassName,
}: {
  icon: ReactNode;
  value: string | number;
  accentClassName: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
        accentClassName
      )}
    >
      {icon}
      {value}
    </span>
  );
}

export default function PostCard({
  post,
  onClick,
  onEdit,
  onDelete,
  showEditButton = false,
  showDeleteButton = false,
}: PostCardProps) {
  const displayTitle = post.title?.trim() || (post.status === "draft" ? "Untitled Draft" : "Untitled Post");
  const displayExcerpt = post.exceprt?.trim() || "No excerpt yet.";
  const isDraft = post.status === "draft";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isClickable = Boolean(onClick);

  return (
    <article
      onClick={onClick}
      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void onClick?.();
        }
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.8rem] border border-toffeebrown/14 bg-eggshell/96 text-toffeebrown shadow-[0_22px_60px_rgba(158,98,64,0.08)] transition-all duration-300",
        isClickable && "cursor-pointer hover:-translate-y-1 hover:border-rossycopper/30 hover:shadow-[0_28px_70px_rgba(158,98,64,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyreflection/45"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-lightbronze/14 via-lightbronze/6 to-transparent" />

      {((showEditButton && onEdit) || (showDeleteButton && onDelete)) && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          {showEditButton && onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void onEdit();
              }}
              className="inline-flex h-9 items-center justify-center rounded-full border border-eggshell/24 bg-eggshell/12 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-eggshell backdrop-blur-sm transition-colors hover:bg-eggshell/20"
              aria-label={`Edit ${displayTitle}`}
            >
              <Pencil className="size-3.5" />
            </button>
          )}

          {showDeleteButton && onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void onDelete();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rossycopper/35 bg-eggshell/12 text-eggshell backdrop-blur-sm transition-colors hover:border-rossycopper hover:bg-rossycopper hover:text-eggshell"
              aria-label={`Delete ${displayTitle}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden border-b border-toffeebrown/10">
        {post.featured_img ? (
          <img
            src={post.featured_img}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-linear-to-br from-lightbronze via-eggshell to-skyreflection p-5 sm:p-6">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/55">
                {isDraft ? "Draft Note" : "Story Card"}
              </p>
              <p className="mt-3 max-w-[16rem] text-2xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-toffeebrown/78">
                {displayTitle}
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-toffeebrown/50 via-transparent to-eggshell/12" />
        <div className="absolute left-4 top-4">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm",
              isDraft
                ? "border-skyreflection/35 bg-skyreflection/18 text-toffeebrown"
                : "border-eggshell/25 bg-eggshell/12 text-eggshell"
            )}
          >
            {isDraft ? "Draft" : "Published"}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-toffeebrown/56">
          <span className="inline-flex items-center gap-2 rounded-full border border-toffeebrown/10 bg-lightbronze/12 px-3 py-1.5">
            <Calendar className="size-3.5" />
            {formatDate(post.created_at)}
          </span>
          <span className="inline-flex items-center rounded-full border border-toffeebrown/10 bg-eggshell px-3 py-1.5">
            {isDraft ? "Continue drafting" : "Open story"}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-[1.55rem] font-black uppercase leading-[0.94] tracking-[-0.05em] text-toffeebrown transition-colors duration-300 group-hover:text-rossycopper sm:text-[1.7rem]">
          {displayTitle}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-toffeebrown/72 sm:text-[0.98rem]">
          {displayExcerpt}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatPill
            icon={<Eye className="size-3.5" />}
            value={post.view_count.toLocaleString()}
            accentClassName="border-skyreflection/30 bg-skyreflection/14 text-toffeebrown"
          />
          <StatPill
            icon={<ThumbsUp className="size-3.5" />}
            value={post.likes_count.toLocaleString()}
            accentClassName="border-lightbronze/30 bg-lightbronze/14 text-toffeebrown"
          />
          <StatPill
            icon={<MessageCircle className="size-3.5" />}
            value={post.comments_count.toLocaleString()}
            accentClassName="border-rossycopper/18 bg-rossycopper/10 text-toffeebrown"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-toffeebrown/10 pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-toffeebrown/48">
            {isDraft ? "Private workspace" : "Reader-facing post"}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-rossycopper">
            {isDraft ? "Edit draft" : "Read now"}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
