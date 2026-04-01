import { ArrowUpRight, Eye, Heart, MessageCircle } from "lucide-react"
import { type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { type Tag } from "@/pages/Home"
import { cn } from "@/lib/utils"

export interface CardProps {
  id: string;
  title: string;
  featured_img?: string | null;
  view_count: number;
  likes_count: number;
  comments_count: number;
  tags: Tag[];
  exceprt?: string;
}

const Card = ({ id, title, featured_img, view_count, likes_count, comments_count, exceprt, tags }: CardProps) => {
  const navigate = useNavigate();
  const previewTags = tags.slice(0, 4);

  const navigateToPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  return (
    <button
      type="button"
      className="group relative block w-full overflow-hidden rounded-[2rem] border border-toffeebrown/15 bg-eggshell/85 text-left transition-transform duration-300 hover:-translate-y-1 hover:border-rossycopper/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rossycopper/35"
      onClick={() => navigateToPost(id)}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-lightbronze/0 via-lightbronze/80 to-skyreflection/0" />

      <div className="grid gap-0 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="relative overflow-hidden border-b border-toffeebrown/10 sm:border-r sm:border-b-0">
          <div className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full border border-eggshell/30 bg-eggshell/85 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-toffeebrown">
            Featured
          </div>

          {featured_img ? (
            <img
              src={featured_img}
              alt={title}
              className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full"
            />
          ) : (
            <div className="flex h-56 w-full items-end bg-linear-to-br from-lightbronze via-eggshell to-skyreflection p-5 sm:h-full">
              <span className="text-[2.8rem] font-black uppercase leading-none tracking-[-0.08em] text-toffeebrown/70">
                {title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-toffeebrown/35 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        </div>

        <div className="relative flex min-w-0 flex-col gap-5 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-toffeebrown/52">
                Fresh From The Feed
              </p>
              <h3 className="mt-3 max-w-3xl text-[clamp(1.6rem,4.4vw,2.75rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-toffeebrown transition-colors duration-300 group-hover:text-rossycopper">
                {title}
              </h3>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-rossycopper/18 bg-rossycopper/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-rossycopper transition-colors duration-300 group-hover:border-rossycopper/30 group-hover:bg-rossycopper/14">
              Open Post
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-toffeebrown/76 sm:text-[0.96rem]">
            {exceprt || "Open the post to read the full write-up, notes, and comment thread."}
          </p>

          <div className="flex flex-wrap gap-2">
            {previewTags.length > 0 ? (
              previewTags.map((tag, index) => (
                <span
                  key={tag.id}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em]",
                    index % 2 === 0
                      ? "border-skyreflection/35 bg-skyreflection/16 text-toffeebrown"
                      : "border-lightbronze/35 bg-lightbronze/18 text-toffeebrown"
                  )}
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center rounded-full border border-toffeebrown/15 bg-toffeebrown/8 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-toffeebrown/58">
                General
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <StatBadge
              icon={<Eye className="h-4 w-4" />}
              count={view_count}
              label="Views"
              className="border-skyreflection/35 bg-skyreflection/16"
            />
            <StatBadge
              icon={<Heart className="h-4 w-4" />}
              count={likes_count}
              label="Likes"
              className="border-lightbronze/35 bg-lightbronze/18"
            />
            <StatBadge
              icon={<MessageCircle className="h-4 w-4" />}
              count={comments_count}
              label="Comments"
              className="border-rossycopper/18 bg-rossycopper/10"
            />
          </div>
        </div>
      </div>
    </button>
  )
}

const StatBadge = ({
  icon,
  count,
  label,
  className,
}: {
  icon: ReactNode;
  count: number;
  label: string;
  className?: string;
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-toffeebrown transition-colors duration-300",
      className
    )}
  >
    {icon}
    <span className="text-sm font-semibold">{formatCount(count)}</span>
    <span className="hidden text-xs text-toffeebrown/60 sm:inline">{label}</span>
  </div>
);

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

export default Card
