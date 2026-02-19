import Card from "@/components/Card"
import { Pagination } from "@/components/Pagination"
import SearchBar from "@/components/SearchBar"
import { Highlighter } from "@/components/ui/highlighter"
import { MorphingText } from "@/components/ui/morphing-text"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import api from "@/config/api"
import { useEffect, useRef, useState } from "react"
import { type CardProps } from "@/components/Card"

export type Tag = {
  id:string,
  name:string,
  slug:string
}

const Home = () => {
  const [currenrPage,setcurrentPage] = useState(1);
  const [totalPage,settotalPage] = useState(10);
  const [limit,setlimit] = useState(5);
  const [query,setQuery] = useState<string>("");
  const [tags,setTags] = useState<Tag[]>([]);
  const [selectedTag,setSelecetdTag] = useState("");
  const [sortBy,setSortBy] = useState<string>("created_at");
  const [posts,setposts] = useState<CardProps[]>([]);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    const fetchData = async() => {
      try {
        const resposne = await api.get("/api/posts",{
          params:{
            tags:selectedTag,
            sortBy:sortBy,
            q:query,
            page:currenrPage,
            limit:limit
          }
        });
        settotalPage(resposne.data.totalPages);
        setlimit(resposne.data.perPage);
        setposts(resposne.data.data)
        const tagRes = await api.get("/api/tags");
        setTags(tagRes.data)
      } catch (error) {
        console.error("Error in API call:-",error)
      }
    }
    fetchData();
  },[currenrPage,limit,query,sortBy,selectedTag]);
  
  useEffect(() => {
  cardsRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}, [currenrPage]);


  const handleNext = () => {
    if(currenrPage < totalPage){
      setcurrentPage((prev)=>prev+1)
    }
  }

  const handleMostLiked = () => {
    setSortBy("likes_count")
  }

  const handleMostViewed = () => {
    setSortBy("view_count")
  }

  const handleRecent = () => {
    setSortBy("created_at")
  }

  const handleSlectedTag = (slug:string) => {
    setSelecetdTag(slug)
  }

  const handlePrev = () => {
    if(currenrPage > 1){
      setcurrentPage((prev)=>prev-1)
    }
  }
  // console.log("all Posts:",posts)
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="w-full h-16 bg-black border-b-2 border-fuchsia-500 px-8 shadow-[0_4px_20px_rgba(217,70,239,0.5)] flex items-center justify-between sticky top-0 z-50">
        <MorphingText
          className="text-fuchsia-400 font-bold text-2xl -ms-90 mt-13"
          texts={["Dev", "Blog", "Post"]}
        />
        <RainbowButton size="default">Login</RainbowButton>
      </nav>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-10 mt-8">
        <div className="w-full sm:w-1/2">
          <SearchBar query={query} setQuery={setQuery}/>
        </div>
        <div className="flex gap-3">
          <ShimmerButton onClick={handleMostLiked}>Most Liked</ShimmerButton>
          <ShimmerButton onClick={handleMostViewed}>Most Viewed</ShimmerButton>
          <ShimmerButton onClick={handleRecent}>Recent</ShimmerButton>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-10 mt-8 gap-6 px-4">

        {/* Sidebar */}
        <aside className="col-span-3 rounded-2xl bg-white/3 border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] p-8 h-fit sticky top-24">
          <div className="text-3xl font-bold text-center mb-8">
            <Highlighter action="underline" color="#FF00FF">
              <span className="text-fuchsia-400">Tags</span>
            </Highlighter>
          </div>

          <div className="flex flex-col gap-3">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="w-full py-2 px-4 rounded-lg border border-fuchsia-500/40 text-fuchsia-300 text-sm font-medium
                           bg-fuchsia-500/5 hover:bg-fuchsia-500/20 hover:border-fuchsia-400 hover:text-white
                           hover:shadow-[0_0_12px_rgba(217,70,239,0.4)] transition-all duration-200 cursor-pointer"
                onClick={() => handleSlectedTag(tag.slug)}
              >
                # {tag.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Cards */}
        <main ref={cardsRef} className="col-span-7 flex flex-col gap-5 pr-4 pb-10">
          {posts.map((i) => (
            <Card
              key={i.id}
              id={i.id}
              title={i.title}
              featured_img={i.featured_img}
              view_count={i.view_count}
              comments_count={i.comments_count}
              likes_count={i.likes_count}
              exceprt={i.exceprt}
              tags={i.tags}
            />
          ))}
        </main>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Pagination currentPage={currenrPage} totalPage={totalPage} onHandleNext={handleNext} onHandlePrevious={handlePrev}/>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }} className="ms-2 mt-3 mb-4">
          Page {currenrPage} of {totalPage} — click Next / Prev
        </p>
      </div>
    </div>
  )
}

export default Home