import { MarqueeDemo } from "@/components/3dReviews"
import { FlipButton, FlipButtonBack } from "@/components/animate-ui/components/buttons/flip"
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid"
import { FlipButtonFront } from "@/components/animate-ui/primitives/buttons/flip"
import { RadixHoverCardDemo } from "@/components/hoverButton"
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28"
import { Skiper58} from "@/components/ui/skiper-ui/skiper58"

const Landing = () => {
  return (
    <>
    <div className="bg-land">
      <div className="grid grid-cols-3">
        <Skiper58/>
        <div className="col-span-2">
          <MarqueeDemo/>
        </div>
      </div>
    <div className="relative flex justify-center items-center gap-5 top-12 mr-2">
    <FlipButton>
      <FlipButtonFront className="bg-amber-50 p-2 ps-5 pe-5 rounded-xl">Make a Post</FlipButtonFront>
      <FlipButtonBack>Make a Post</FlipButtonBack>
    </FlipButton>
    x<RadixHoverCardDemo/>x
    <LiquidButton className="w-max p-5 ps-7 pe-7">See Posts</LiquidButton>
    </div>
    <Skiper28/>
    </div>
    </>
  )
}

export default Landing