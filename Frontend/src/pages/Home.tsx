import Card from "@/components/Card"
import { Pagination } from "@/components/Pagination"
import SearchBar from "@/components/SearchBar"
import { Highlighter } from "@/components/ui/highlighter"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import api from "@/config/api"
import { useEffect, useRef, useState } from "react"
import { type CardProps } from "@/components/Card"
import { X } from "lucide-react"
import { HyperText } from "@/components/ui/hyper-text"
import { RippleButton } from "@/components/ui/ripple-button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export type Tag = {
  id: string,
  name: string,
  slug: string
}

const Home = () => {
  const [currenrPage, setcurrentPage] = useState(1);
  const [totalPage, settotalPage] = useState(10);
  const [limit, setlimit] = useState(5);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelecetdTag] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [user, setUser] = useState<any>(null);
  const [posts, setposts] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate()
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me", {
          withCredentials: true
        });
        console.log(res)

        setUser(res.data);

      } catch (error) {
        setUser(null);
      }
    };

    checkAuth();
  }, []);
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

  const onAuthorClick = async (user_name: string) => {
    navigate(`/profile/${user_name}`)
  }

  const handleMostLiked = () => {
    setcurrentPage(1);
    setSortBy("likes_count");
  };

  const handleMostViewed = () => {
    setcurrentPage(1);
    setSortBy("view_count");
  };

  const handleRecent = () => {
    setcurrentPage(1);
    setSortBy("created_at");
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

  return (
    <div className="relative min-h-screen bg-linear-to-b from-black via-slate-950 to-black text-white">
      {loading && !hasLoadedOnce && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-vio)"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
              className="text-white"
            />
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="w-full h-18 bg-black/50 backdrop-blur-md border-b border-fuchsia-500/30 px-8 shadow-[0_4px_20px_rgba(217,70,239,0.3)] flex items-center justify-between sticky top-0 z-50">
        <HyperText className="text-2xl">Dev_Blog</HyperText>

        <div className="flex gap-8">
          <RippleButton onClick={()=>navigate("/createpost")}>
            <Plus size={16} className="mt-0.5" />
            Create Post
          </RippleButton>
          {user ? (
            <RainbowButton size="icon" onClick={()=>onAuthorClick(user.user_name)}>
              <img
                src={user.avatar_url}
                className="rounded-3xl p-0.5"
                referrerPolicy="no-referrer"
              />
            </RainbowButton>
          ) : (
            <RainbowButton size="default" onClick={() => window.location.href = "https://dev-blog-post.onrender.com/auth/google"}>Login</RainbowButton>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Section */}
        <div className="mb-10">
          <div className="w-full">
            <SearchBar
              value={inputQuery}
              onChange={setInputQuery}
              onSubmit={handleSearchSubmit}
            />
          </div>
          <p className="text-xs text-fuchsia-300/50 mt-2">
            {query && `Searching for: "${query}"`}
          </p>
        </div>

        {/* Filter & Sort Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-fuchsia-300 mb-3">Sort By</p>
            <div className="flex flex-wrap gap-2">
              <ShimmerButton
                onClick={handleRecent}
                className={sortBy === "created_at" ? "ring-2 ring-fuchsia-400" : ""}
              >
                Recent
              </ShimmerButton>
              <ShimmerButton
                onClick={handleMostLiked}
                className={sortBy === "likes_count" ? "ring-2 ring-fuchsia-400" : ""}
              >
                Most Liked
              </ShimmerButton>
              <ShimmerButton
                onClick={handleMostViewed}
                className={sortBy === "view_count" ? "ring-2 ring-fuchsia-400" : ""}
              >
                Most Viewed
              </ShimmerButton>
            </div>
          </div>
        </div>

        {/* Selected Tag Display */}
        {selectedTag && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg w-fit">
            <span className="text-sm text-fuchsia-300">
              Tagged: <span className="font-semibold">{selectedTag}</span>
            </span>
            <button
              onClick={handleClearTag}
              className="p-1 hover:bg-fuchsia-500/20 rounded transition-colors"
            >
              <X size={16} className="text-fuchsia-400" />
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Tags Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="rounded-2xl bg-white/3 border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] p-6 sticky top-24 h-fit">
              <div className="text-2xl font-bold text-center mb-6">
                <Highlighter action="underline" color="#FF00FF">
                  <span className="text-fuchsia-400">Tags</span>
                </Highlighter>
              </div>

              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={`w-full py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer text-left
                        ${selectedTag === tag.slug
                          ? "bg-fuchsia-500/30 border-fuchsia-400 text-white shadow-[0_0_12px_rgba(217,70,239,0.6)]"
                          : "border-fuchsia-500/40 text-fuchsia-300 bg-fuchsia-500/5 hover:bg-fuchsia-500/20 hover:border-fuchsia-400 hover:text-white hover:shadow-[0_0_12px_rgba(217,70,239,0.4)]"
                        }`}
                      onClick={() => handleSlectedTag(tag.slug)}
                    >
                      # {tag.name}
                    </button>
                  ))
                ) : (
                  <p className="text-fuchsia-300/50 text-sm text-center py-4">No tags available</p>
                )}
              </div>
            </div>
          </aside>

          {/* Cards Section */}
          <main ref={cardsRef} className="lg:col-span-2 order-1 lg:order-2 flex flex-col gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="animate-fadeIn">
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
              <div className="col-span-full text-center py-12">
                <p className="text-fuchsia-300/50 text-lg">No posts found</p>
              </div>
            )}
          </main>

        </div>

        {/* Pagination Section */}
        <div className="flex flex-col items-center justify-center mt-14 gap-4">
          <Pagination
            currentPage={currenrPage}
            totalPage={totalPage}
            onHandleNext={handleNext}
            onHandlePrevious={handlePrev}
          />
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif"
          }} className="mt-2">
            Page <span className="font-semibold text-fuchsia-300">{currenrPage}</span> of <span className="font-semibold text-fuchsia-300">{totalPage}</span>
          </p>
        </div>

      </div>

      {/* Loading Overlay */}
      {loading && hasLoadedOnce && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-vio)"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
              className="text-white"
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar for tags */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(217, 70, 239, 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 70, 239, 0.5);
        }
      `}</style>
    </div>
  )
}

export default Home