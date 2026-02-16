import Card from "@/components/Card"
import SearchBar from "@/components/SearchBar"
import { MorphingText } from "@/components/ui/morphing-text"
import { ShimmerButton } from "@/components/ui/shimmer-button"

const Home = () => {
  return (
    <>
    <div>
      <nav className="w-full h-15 mb-5 bg-vio p-2 rounded-b-xl">
          <MorphingText className="-ms-80 " texts={["Dev","Blog","Post"]}/>
      </nav>
      <div className="grid grid-cols-10">
        <div className="-ms-100 col-span-7">
          <SearchBar/>
        </div>
        <div className="flex w-max gap-7 -ms-80">
          <ShimmerButton>Most Liked</ShimmerButton>
          <ShimmerButton>Most Viewed</ShimmerButton>
          <ShimmerButton>Recent</ShimmerButton>
        </div>
      </div>
    <div className="grid grid-cols-10 mt-10">
      <div className="col-span-3">
        jdjsjd
      </div>
      <div className="col-span-6">
        <Card
    title="Awsome"
    featured_img="https://res.cloudinary.com/ddsfvhsqo/image/upload/v1769944667/posts/cbhmihqzfg7n0cvn7d9b.jpg"
    view_count={300}
    comments_count={20}
    likes_count={10}
    />
      </div>
    </div>
    </div>
    
    </>
  )
}

export default Home