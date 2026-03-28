import { cn } from "@/lib/utils"
import { Marquee } from "./ui/marquee"

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-2xl p-3 backdrop-blur-xl",
        "bg-black border border-white/10  transition-all duration-300",
        "hover:border-white/30"
      )}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>
      <div className="flex flex-row items-center gap-3 mb-4">
        <img 
          className="rounded-full border border-white/20" 
          width="40" 
          height="40" 
          alt="" 
          src={img} 
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-white">
            {name}
          </figcaption>
          <p className="text-xs text-emerald-400/80">{username}</p>
        </div>
      </div>
      <blockquote className="text-sm leading-relaxed text-gray-100">"{body}"</blockquote>
    </figure>
  )
}

export function MarqueeDemo() {
  return (
    <div className="relative flex w-250 flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-land to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-land to-transparent"></div>
    </div>
  )
}
