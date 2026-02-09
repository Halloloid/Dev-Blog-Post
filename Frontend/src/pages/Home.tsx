import { FlipButton, FlipButtonBack } from "@/components/animate-ui/components/buttons/flip"
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid"
import { FlipButtonFront } from "@/components/animate-ui/primitives/buttons/flip"
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28"

const Home = () => {
  return (
    <>
    <div className="bg-[#32cd32]">
    <div className="relative flex justify-center items-center gap-20 top-70 ">
    <FlipButton>
      <FlipButtonFront className="bg-amber-50 p-2 ps-5 pe-5 rounded-xl">Make a Post</FlipButtonFront>
      <FlipButtonBack>Make a Post</FlipButtonBack>
    </FlipButton>
    <LiquidButton className="w-max p-5 ps-7 pe-7">See Posts</LiquidButton>
    </div>
    <Skiper28/>
    </div>
    </>
  )
}

export default Home