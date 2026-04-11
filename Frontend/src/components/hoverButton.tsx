import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/animate-ui/components/radix/hover-card';

const avatarUrl = 'https://avatars.githubusercontent.com/u/199330005?v=4';

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
          className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-eggshell/35 shadow-[0_10px_25px_rgba(0,0,0,0.16)] transition-transform duration-300 hover:scale-[1.03] sm:size-14"
          href="https://github.com/Halloloid"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open Halloloid on GitHub"
        >
          <img
            className="block size-full object-cover object-center"
            src={avatarUrl}
            alt="Halloloid avatar"
          />
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.5rem] border border-gray-800 bg-black p-4 sm:w-80"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              className="size-14 shrink-0 overflow-hidden rounded-full border border-gray-600 object-cover object-center sm:size-16"
              src={avatarUrl}
              alt="Halloloid avatar"
            />
            <div>
              <div className="font-bold text-white">Amrut Prasad</div>
              <div className="text-sm text-gray-400">@Halloloid</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm leading-6 text-gray-300">
              Building scalable, maintainable, and reliable backend systems 
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
