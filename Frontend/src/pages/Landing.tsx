import { MarqueeDemo } from "@/components/3dReviews"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/animate-ui/components/buttons/flip"
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid"
import { RadixHoverCardDemo } from "@/components/hoverButton"
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28"
import { Skiper58, TextRoll } from "@/components/ui/skiper-ui/skiper58"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"

const Landing = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-rossycopper text-eggshell">
      <section id="top" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,242,220,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_42%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
            <div className="order-2 xl:order-1">
              <Skiper58 />
            </div>

            <div className="order-1 flex flex-col gap-5 rounded-[2rem] border border-eggshell/20 bg-black/10 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:gap-6 sm:p-7 lg:p-8 xl:order-2">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-eggshell/70 sm:text-sm sm:tracking-[0.38em]">
                  DevBlog Landing
                </p>
                <TextRoll
                  className={cn(
                    "max-w-4xl text-[clamp(1.95rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-eggshell sm:text-balance sm:leading-[0.88] sm:tracking-[-0.05em] m-1"
                  )}
                >
                  Publish
                </TextRoll>
                <TextRoll
                  className={cn(
                    "max-w-4xl text-[clamp(1.95rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-eggshell sm:text-balance sm:leading-[0.88] sm:tracking-[-0.05em] m-1"
                  )}
                >
                  openly
                </TextRoll>
                <TextRoll
                  className={cn(
                    "max-w-4xl text-[clamp(1.95rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-eggshell sm:text-balance sm:leading-[0.88] sm:tracking-[-0.05em] m-1"
                  )}
                >
                  with a
                </TextRoll>
                <TextRoll
                  className={cn(
                    "max-w-4xl text-[clamp(1.95rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-eggshell sm:text-balance sm:leading-[0.88] sm:tracking-[-0.05em] m-1"
                  )}
                >
                  handmade
                </TextRoll>
                <TextRoll
                  className={cn(
                    "max-w-4xl text-[clamp(1.95rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-eggshell sm:text-balance sm:leading-[0.88] sm:tracking-[-0.05em] m-1"
                  )}
                >
                  voice
                </TextRoll>
                <p className="max-w-2xl text-sm leading-6 text-eggshell/82 sm:text-base sm:leading-7 lg:text-lg">
                  DevBlog gives your posts, projects, and in-progress ideas a louder front page.
                </p>
              </div>


              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <FlipButton asChild className="w-full sm:w-auto">
                  <a
                    className="w-full sm:w-auto"
                    href="https://dev-blog-post.onrender.com/auth/google"
                    rel="noreferrer noopener"
                  >
                    <FlipButtonFront className="min-h-12 w-full rounded-full border border-eggshell/30 bg-eggshell px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-rossycopper sm:min-w-52 sm:px-6 sm:tracking-[0.18em]">
                      Make A Post
                    </FlipButtonFront>
                    <FlipButtonBack className="min-h-12 w-full rounded-full border border-black/15 bg-toffeebrown px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-eggshell sm:min-w-52 sm:px-6 sm:tracking-[0.18em]">
                      Join With Google
                    </FlipButtonBack>
                  </a>
                </FlipButton>

                <LiquidButton
                  asChild
                  className="min-h-12 w-full rounded-full border border-eggshell/30 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-lightbronze sm:w-auto sm:min-w-44 sm:px-6 sm:tracking-[0.18em]"
                  fillHeight="100%"
                >
                  <Link to="/home">See Posts</Link>
                </LiquidButton>
              </div>

              <div className="flex items-start gap-3 rounded-[1.5rem] border border-eggshell/15 bg-black/12 p-4 sm:flex-row sm:items-center">
                <RadixHoverCardDemo />
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-eggshell/60 sm:tracking-[0.3em]">
                    Creator Link
                  </p>
                  <p className="text-sm leading-6 text-eggshell/82">
                    Hey Checkout the creator&apos;s
                    GitHub profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Analytics/>
          <section
            id="reviews"
            className="rounded-[2rem] border border-eggshell/20 bg-black/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-6 lg:p-8"
          >
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-eggshell/65 sm:tracking-[0.32em]">
                  Community Signal
                </p>
              </div>
            </div>

            <MarqueeDemo />
          </section>
        </div>
      </section>

      <Skiper28 />
    </main>
  )
}

export default Landing
