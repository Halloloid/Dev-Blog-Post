import { useEffect, useRef, useState } from "react";
import { House, PencilLine, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

type AppNavbarProps = {
  user: {
    avatar_url: string;
    user_name: string | null;
  } | null;
  onHeightChange?: (height: number) => void;
};

function AppNavbar({ user, onHeightChange }: AppNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = location.pathname;
  const isHome = pathname === "/home";
  const isCreate = pathname.startsWith("/createpost");

  const navButtonClassName =
    "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors sm:px-4 sm:text-[0.78rem]";
  const neutralButtonClassName =
    `${navButtonClassName} border-toffeebrown/12 bg-eggshell/78 text-toffeebrown hover:border-rossycopper/28 hover:bg-lightbronze/18`;
  const homeButtonClassName = cn(
    neutralButtonClassName,
    isHome && "border-rossycopper bg-rossycopper text-eggshell hover:bg-rossycopper"
  );
  const createButtonClassName = cn(
    neutralButtonClassName,
    isCreate
      ? "border-skyreflection bg-skyreflection text-toffeebrown hover:bg-skyreflection"
      : "hover:border-skyreflection/35 hover:bg-skyreflection/14"
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= 12) {
        setIsVisible(true);
      } else if (delta > 6) {
        setIsVisible(false);
      } else if (delta < -6) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const element = navRef.current;
    if (!element || !onHeightChange) return;

    const updateHeight = () => {
      onHeightChange(element.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed inset-x-0 top-0 z-[120] px-3 py-2 transition-transform duration-300 ease-out sm:px-4 lg:px-6",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1rem] border border-toffeebrown/12 bg-eggshell/94 shadow-[0_12px_28px_rgba(158,98,64,0.08)] backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-skyreflection)_0%,transparent_24%)] opacity-12" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-lightbronze)_0%,transparent_28%)] opacity-12" />

          <div className="relative flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="min-w-0 shrink-0 text-left"
            >
              <span className="block text-[1rem] font-black uppercase leading-none tracking-[-0.06em] text-toffeebrown sm:text-[1.18rem]">
                Dev_Blog
              </span>
            </button>

            <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className={homeButtonClassName}
              >
                <House className="size-4" />
              </button>

              {user?.user_name ? (
                <button
                  type="button"
                  onClick={() => navigate(`/createpost/${user.user_name}`)}
                  className={createButtonClassName}
                >
                  <PencilLine className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={cn(
                    navButtonClassName,
                    "cursor-not-allowed border-toffeebrown/10 bg-eggshell/60 text-toffeebrown/35"
                  )}
                >
                  <PencilLine className="size-4" />
                </button>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={() => user.user_name && navigate(`/profile/${user.user_name}`)}
                  disabled={!user.user_name}
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-toffeebrown/12 bg-eggshell/78 transition-colors hover:border-rossycopper/28 hover:bg-lightbronze/18",
                    !user.user_name && "cursor-not-allowed opacity-60"
                  )}
                  aria-label="Open profile"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.user_name ?? "Profile"}
                    className="size-8 shrink-0 rounded-full border border-toffeebrown/12 bg-eggshell object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "https://dev-blog-post.onrender.com/auth/google";
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-toffeebrown bg-toffeebrown px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-eggshell transition-colors hover:bg-rossycopper sm:px-4 sm:text-[0.78rem]"
                >
                  <UserRound className="size-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
