import { MarqueeDemo } from "@/components/3dReviews"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/animate-ui/components/buttons/flip"
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid"
import { RadixHoverCardDemo } from "@/components/hoverButton"
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28"
import { Skiper58 } from "@/components/ui/skiper-ui/skiper58"
import { Link } from "react-router-dom"

const highlights = [
  {
    title: "Built For Phones",
    body: "Readable type, stacked content, and touch-friendly spacing from the first breakpoint up.",
  },
  {
    title: "Made To Share",
    body: "Show blog posts, project updates, experiments, and notes without the landing page feeling crowded.",
  },
  {
    title: "Old-School Warmth",
    body: "A bold editorial look with motion and color that still stays calm on smaller screens.",
  },
]

const Landing = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-rossycopper text-eggshell">
      <section id="top" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,242,220,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_42%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
            <div className="order-2 xl:order-1">
              <Skiper58 />
            </div>

            <div className="order-1 flex flex-col gap-6 rounded-[2rem] border border-eggshell/20 bg-black/10 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-7 lg:p-8 xl:order-2">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.38em] text-eggshell/70 sm:text-sm">
                  DevBlog Landing
                </p>
                <h1 className="max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em] text-eggshell">
                  Write in public without losing the handmade feel.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-eggshell/82 sm:text-base lg:text-lg">
                  DevBlog gives your posts, projects, and in-progress ideas a louder front page.
                  The layout now scales cleanly from desktop down to mobile, so the story still
                  lands even on a small screen.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((highlight) => (
                  <article
                    key={highlight.title}
                    className="rounded-[1.5rem] border border-eggshell/15 bg-eggshell/10 p-4 text-left backdrop-blur-sm"
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-eggshell">
                      {highlight.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-eggshell/78">{highlight.body}</p>
                  </article>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <FlipButton asChild className="w-full sm:w-auto">
                  <a
                    className="w-full sm:w-auto"
                    href="https://dev-blog-post.onrender.com/auth/google"
                    rel="noreferrer noopener"
                  >
                    <FlipButtonFront className="min-h-12 w-full rounded-full border border-eggshell/30 bg-eggshell px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-rossycopper sm:min-w-52">
                      Make A Post
                    </FlipButtonFront>
                    <FlipButtonBack className="min-h-12 w-full rounded-full border border-black/15 bg-toffeebrown px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-eggshell sm:min-w-52">
                      Join With Google
                    </FlipButtonBack>
                  </a>
                </FlipButton>

                <LiquidButton
                  asChild
                  className="min-h-12 w-full rounded-full border border-eggshell/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-eggshell sm:w-auto sm:min-w-44"
                  fillHeight="100%"
                >
                  <Link to="/home">See Posts</Link>
                </LiquidButton>
              </div>

              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-eggshell/15 bg-black/12 p-4 sm:flex-row sm:items-center">
                <RadixHoverCardDemo />
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-eggshell/60">
                    Creator Link
                  </p>
                  <p className="text-sm leading-6 text-eggshell/82">
                    Hover on desktop or tap on mobile to jump straight to the project creator&apos;s
                    GitHub profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section
            id="reviews"
            className="rounded-[2rem] border border-eggshell/20 bg-black/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-6 lg:p-8"
          >
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-eggshell/65">
                  Community Signal
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-eggshell sm:text-3xl lg:text-4xl">
                  Motion that still reads well on mobile.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-eggshell/76 sm:text-right">
                Review cards now scale to the viewport, keep their spacing, and stop forcing a
                desktop-only width.
              </p>
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
