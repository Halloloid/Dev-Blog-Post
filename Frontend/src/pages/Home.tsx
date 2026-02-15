import Card from "@/components/Card"

const Home = () => {
  return (
    <>
    <div>
      <nav>aa</nav>
      <div>
        
      </div>
    <div className="grid grid-cols-10">
      <div className="col-span-4">
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