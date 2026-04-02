import { UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  isFollowing?: boolean;
  onClick?: () => void | Promise<void>;
}

export default function FollowButton({
  isFollowing = false,
  onClick,
}: FollowButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick?.();
      }}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300 sm:w-auto",
        isFollowing
          ? "border-eggshell/24 bg-eggshell/10 text-eggshell hover:bg-eggshell/16"
          : "border-eggshell bg-eggshell text-toffeebrown hover:border-lightbronze hover:bg-lightbronze"
      )}
    >
      {isFollowing ? (
        <>
          <UserCheck className="size-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="size-4" />
          Follow Creator
        </>
      )}
    </button>
  );
}
