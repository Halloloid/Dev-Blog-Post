import Card, { type CardProps } from "@/components/Card"
import { Pagination } from "@/components/Pagination"
import SearchBar from "@/components/SearchBar"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import api from "@/config/api"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export type Tag = {
  id: string,
  name: string,
  slug: string
}

const sortOptions = [
  { label: "Recent", value: "created_at" },
  { label: "Most Liked", value: "likes_count" },
  { label: "Most Viewed", value: "view_count" },
] as const

const Home = () => {
  const [currenrPage, setcurrentPage] = useState(1);
  const [totalPage, settotalPage] = useState(10);
  const [limit, setlimit] = useState(5);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelecetdTag] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [posts, setposts] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setLoading(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fetchData = async () => {
      try {
        const [resposne, tagRes] = await Promise.all([
          api.get("/api/posts", {
            params: {
              tags: selectedTag,
              sortBy: sortBy,
              q: query,
              page: currenrPage,
              limit: limit
            }
          }),
          api.get("/api/tags")
        ]);
        settotalPage(resposne.data.totalPages);
        setlimit(resposne.data.perPage);
        setposts(resposne.data.data);
        setTags(tagRes.data);
      } catch (error) {
        console.error("Error in API call:-", error);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };
    fetchData();

    return () => clearInterval(progressInterval);
  }, [currenrPage, limit, query, sortBy, selectedTag]);

  useEffect(() => {
    cardsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [currenrPage]);

  const handleNext = () => {
    if (currenrPage < totalPage) {
      setcurrentPage((prev) => prev + 1);
    }
  };

  const handleSlectedTag = (slug: string) => {
    setcurrentPage(1);
    setSelecetdTag(slug);
  };

  const handleClearTag = () => {
    setcurrentPage(1);
    setSelecetdTag("");
  };

  const handleSearchSubmit = (searchValue: string) => {
    setcurrentPage(1);
    setQuery(searchValue.trim());
  };

  const handlePrev = () => {
    if (currenrPage > 1) {
      setcurrentPage((prev) => prev - 1);
    }
  };

  const activeSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ?? "Recent";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-eggshell text-toffeebrown">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-lightbronze/35 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-skyreflection/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rossycopper/15 blur-3xl" />
      </div>

      {loading && !hasLoadedOnce && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-eggshell/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="var(--color-lightbronze)"
              className="text-toffeebrown"
            />
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-[calc(var(--app-navbar-height,0px)+1rem)] sm:px-6 sm:pb-6 sm:pt-[calc(var(--app-navbar-height,0px)+1.25rem)] lg:px-8 lg:pb-8 lg:pt-[calc(var(--app-navbar-height,0px)+1.5rem)]">
        <section className="overflow-hidden rounded-[2rem] border border-toffeebrown/15 bg-rossycopper text-eggshell shadow-[0_24px_80px_rgba(158,98,64,0.18)]">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-eggshell/70">
                  DevBlog Home
                </p>
                <h1 className="max-w-4xl text-[clamp(2.4rem,7vw,5.2rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-eggshell">
                  Browse developer notes, launches, and late-night builds.
                </h1>
              </div>

              <div className="w-full">
                <SearchBar
                  value={inputQuery}
                  onChange={setInputQuery}
                  onSubmit={handleSearchSubmit}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-eggshell/20 bg-eggshell/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/78">
                  Sort: {activeSortLabel}
                </span>
                <span className="inline-flex items-center rounded-full border border-eggshell/20 bg-eggshell/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/78">
                  {selectedTag ? `Tag: ${selectedTag}` : "All Tags"}
                </span>
                <span className="inline-flex items-center rounded-full border border-eggshell/20 bg-eggshell/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/78">
                  {query ? `Query: ${query}` : "Open Feed"}
                </span>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-eggshell/20 bg-eggshell/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eggshell/68">
                Browsing Snapshot
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-eggshell/15 bg-toffeebrown/12 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-eggshell/60">
                    Showing
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-eggshell">
                    {posts.length}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-eggshell/15 bg-toffeebrown/12 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-eggshell/60">
                    Page
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-eggshell">
                    {currenrPage}
                  </p>
                </div>
                <div className="col-span-2 rounded-[1.25rem] border border-eggshell/15 bg-toffeebrown/12 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-eggshell/60">
                    Current Focus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-eggshell/82">
                    {selectedTag
                      ? `Filtered by #${selectedTag} and sorted by ${activeSortLabel}.`
                      : `Browsing all posts sorted by ${activeSortLabel}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="order-2 xl:order-1">
            <div className="space-y-4 xl:sticky xl:top-[calc(var(--app-navbar-height,0px)+1.5rem)]">
              <section className="rounded-[1.75rem] border border-toffeebrown/15 bg-eggshell/80 p-5 shadow-[0_18px_60px_rgba(158,98,64,0.08)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-toffeebrown/55">
                  Sort Feed
                </p>
                <div className="mt-4 flex flex-wrap gap-2 xl:flex-col">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setcurrentPage(1);
                        setSortBy(option.value);
                      }}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                        sortBy === option.value
                          ? "border-rossycopper bg-rossycopper text-eggshell"
                          : "border-toffeebrown/18 bg-eggshell text-toffeebrown hover:border-rossycopper/40 hover:bg-lightbronze/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-toffeebrown/15 bg-eggshell/80 p-5 shadow-[0_18px_60px_rgba(158,98,64,0.08)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-toffeebrown/55">
                      Tags
                    </p>
                    <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-toffeebrown">
                      Filter By Topic
                    </h2>
                  </div>
                  {selectedTag && (
                    <button
                      onClick={handleClearTag}
                      className="inline-flex items-center gap-2 rounded-full border border-rossycopper/20 bg-rossycopper/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-rossycopper transition-colors hover:bg-rossycopper/16"
                    >
                      Clear
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 xl:max-h-[32rem] xl:overflow-y-auto xl:pr-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        className={cn(
                          "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                          selectedTag === tag.slug
                            ? "border-skyreflection bg-skyreflection/20 text-toffeebrown"
                            : "border-toffeebrown/18 bg-eggshell text-toffeebrown/78 hover:border-skyreflection/40 hover:bg-skyreflection/12 hover:text-toffeebrown"
                        )}
                        onClick={() => handleSlectedTag(tag.slug)}
                      >
                        #{tag.name}
                      </button>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-toffeebrown/55">No tags available</p>
                  )}
                </div>
              </section>
            </div>
          </aside>

          <main ref={cardsRef} className="order-1 xl:order-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-toffeebrown/55">
                  Feed
                </p>
                <h2 className="mt-2 text-[clamp(2rem,5vw,3.4rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
                  Developer Posts
                </h2>
              </div>
              <div className="rounded-full border border-toffeebrown/15 bg-eggshell/80 px-4 py-2 text-sm font-semibold text-toffeebrown/72 shadow-[0_12px_30px_rgba(158,98,64,0.08)]">
                Page {currenrPage} of {totalPage}
              </div>
            </div>

            {(query || selectedTag) && (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-toffeebrown/15 bg-eggshell/80 p-4 shadow-[0_16px_40px_rgba(158,98,64,0.06)]">
                {query && (
                  <span className="inline-flex items-center rounded-full border border-lightbronze/30 bg-lightbronze/18 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-toffeebrown">
                    Search: {query}
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center rounded-full border border-skyreflection/35 bg-skyreflection/18 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-toffeebrown">
                    Tag: {selectedTag}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="animate-home-fade-in">
                    <Card
                      id={post.id}
                      title={post.title}
                      featured_img={post.featured_img}
                      view_count={post.view_count}
                      comments_count={post.comments_count}
                      likes_count={post.likes_count}
                      exceprt={post.exceprt}
                      tags={post.tags}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-[1.8rem] border border-toffeebrown/15 bg-eggshell/80 px-6 py-14 text-center shadow-[0_18px_50px_rgba(158,98,64,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-toffeebrown/50">
                    No Results
                  </p>
                  <p className="mt-3 text-lg text-toffeebrown/72">
                    No posts matched the current search or filter.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4">
              <Pagination
                currentPage={currenrPage}
                totalPage={totalPage}
                onHandleNext={handleNext}
                onHandlePrevious={handlePrev}
              />
              <p className="text-sm text-toffeebrown/60">
                Page <span className="font-semibold text-rossycopper">{currenrPage}</span> of{" "}
                <span className="font-semibold text-skyreflection">{totalPage}</span>
              </p>
            </div>
          </main>
        </div>
      </div>

      {loading && hasLoadedOnce && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-eggshell/55 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="var(--color-lightbronze)"
              className="text-toffeebrown"
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes homeFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-home-fade-in {
          animation: homeFadeIn 0.35s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Home
