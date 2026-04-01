import { useEffect, useRef, useState } from "react";
import { HyperText } from "@/components/ui/hyper-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { House, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AppNavbarProps = {
  user: {
    avatar_url: string;
    user_name: string | null;
  } | null;
  onHeightChange?: (height: number) => void;
};

function AppNavbar({ user, onHeightChange }: AppNavbarProps) {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const navButtonClassName =
    "group inline-flex h-10 min-w-0 items-center gap-2 rounded-full border px-3.5 text-[0.78rem] font-bold leading-none transition-all sm:h-11 sm:px-5 sm:text-[0.95rem]";
  const homeButtonClassName =
    `${navButtonClassName} border-vio bg-vio/12 text-vio hover:bg-vio hover:text-black`;
  const createButtonClassName =
    `${navButtonClassName} border-land bg-land text-black hover:bg-[#52ff33]`;
  const disabledButtonClassName =
    `${navButtonClassName} border-white/10 bg-white/5 text-white/35 cursor-not-allowed`;

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
      className={`fixed inset-x-0 top-0 z-[120] w-full min-h-18 border-b border-fuchsia-500/30 bg-black/65 px-4 py-3 backdrop-blur-md transition-transform duration-300 ease-out sm:px-8 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="flex w-full items-center justify-center gap-3 text-left sm:w-auto sm:justify-start"
      >
        <HyperText className="text-xl text-white sm:text-2xl">Dev_Blog</HyperText>
      </button>

      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className={homeButtonClassName}
        >
          <House size={16} />
          <span>Home</span>
        </button>

        {user?.user_name ? (
          <button
            type="button"
            onClick={() => navigate(`/createpost/${user.user_name}`)}
            className={createButtonClassName}
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={disabledButtonClassName}
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        )}

        {user ? (
          <RainbowButton
            size="icon"
            onClick={() => user.user_name && navigate(`/profile/${user.user_name}`)}
            disabled={!user.user_name}
          >
            <img
              src={user.avatar_url}
              className="rounded-3xl p-0.5"
              referrerPolicy="no-referrer"
            />
          </RainbowButton>
        ) : (
          <RainbowButton
            size="default"
            onClick={() => {
              window.location.href = "https://dev-blog-post.onrender.com/auth/google";
            }}
          >
            Login
          </RainbowButton>
        )}
      </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
