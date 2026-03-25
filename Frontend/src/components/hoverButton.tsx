import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/animate-ui/components/radix/hover-card';

interface RadixHoverCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
}

export const RadixHoverCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: RadixHoverCardDemoProps) => {
  return (
    <HoverCard followCursor={followCursor}>
      <HoverCardTrigger asChild>
        <a
          className="size-12 border border-gray-600 rounded-full overflow-hidden"
          href="https://github.com/Halloloid"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img
            src="https://avatars.githubusercontent.com/u/199330005?v=4"
            alt="Animate UI"
            width={"100%"}
          />
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-80 bg-black border-gray-800"
      >
        <div className="flex flex-col gap-4">
          <img
            className="size-16 rounded-full overflow-hidden border border-gray-600"
            src="https://avatars.githubusercontent.com/u/199330005?v=4"
            alt="Animate UI"
          />
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-bold text-white">Animate UI</div>
              <div className="text-sm text-gray-400">@animate_ui</div>
            </div>
            <div className="text-sm text-gray-300">
              A fully animated, open-source component distribution built with
              React, TypeScript, Tailwind CSS, and Motion.
            </div>
            <div className="flex gap-4">
              <div className="flex gap-1 text-sm items-center">
                <div className="font-bold text-white">0</div>{' '}
                <div className="text-gray-400">Following</div>
              </div>
              <div className="flex gap-1 text-sm items-center">
                <div className="font-bold text-white">2,900</div>{' '}
                <div className="text-gray-400">Followers</div>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};