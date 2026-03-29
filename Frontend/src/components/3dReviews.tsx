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
        "relative h-full w-[min(13rem,calc(100vw-3.5rem))] cursor-pointer overflow-hidden rounded-[1.35rem] border border-white/10 bg-eggshell p-3.5 backdrop-blur-xl transition-all duration-300 sm:w-64 sm:rounded-[1.5rem] sm:p-5 lg:w-72",
        "hover:border-white/30 hover:shadow-[0_18px_32px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="absolute inset-0 -z-10 bg-eggshell"></div>
      <div className="mb-3.5 flex flex-row items-center gap-3 sm:mb-4">
        <img
          className="size-9 rounded-full border border-white/20 sm:size-11"
          width="44"
          height="44"
          alt=""
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-toffeebrown sm:text-[0.95rem]">
            {name}
          </figcaption>
          <p className="text-xs text-toffeebrown/70 sm:text-sm">{username}</p>
        </div>
      </div>
      <blockquote className="text-[0.8rem] leading-[1.4rem] text-skyreflection sm:text-[0.95rem] sm:leading-6">
        "{body}"
      </blockquote>
    </figure>
  )
}

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full max-w-full flex-col items-center justify-center overflow-hidden rounded-[1.75rem] py-1 sm:py-2">
      <Marquee
        pauseOnHover
        repeat={2}
        className="w-full [--duration:28s] [--gap:0.55rem] sm:[--duration:24s] sm:[--gap:1rem]"
      >
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="hidden w-full sm:block">
        <Marquee
          reverse
          pauseOnHover
          className="w-full [--duration:24s] [--gap:1rem]"
        >
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8"></div>
    </div>
  )
}
