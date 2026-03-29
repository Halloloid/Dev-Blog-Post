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
        "relative h-full w-[min(16rem,calc(100vw-5.5rem))] cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-eggshell p-4 backdrop-blur-xl transition-all duration-300 sm:w-64 sm:p-5 lg:w-72",
        "hover:border-white/30 hover:shadow-[0_18px_32px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="absolute inset-0 -z-10 bg-eggshell"></div>
      <div className="mb-4 flex flex-row items-center gap-3">
        <img
          className="size-10 rounded-full border border-white/20 sm:size-11"
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
      <blockquote className="text-sm leading-6 text-skyreflection sm:text-[0.95rem]">
        "{body}"
      </blockquote>
    </figure>
  )
}

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full max-w-full flex-col items-center justify-center overflow-hidden rounded-[1.75rem] py-2">
      <Marquee pauseOnHover className="w-full [--duration:24s] [--gap:0.85rem] sm:[--gap:1rem]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        className="w-full [--duration:24s] [--gap:0.85rem] sm:[--gap:1rem]"
      >
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-rossycopper via-rossycopper/80 to-transparent sm:w-24 lg:w-1/4"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-rossycopper via-rossycopper/80 to-transparent sm:w-24 lg:w-1/4"></div>
    </div>
  )
}
