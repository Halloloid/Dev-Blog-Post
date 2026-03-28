import { HyperText } from "@/components/ui/hyper-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { House, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AppNavbarProps = {
  user: {
    avatar_url: string;
    user_name: string | null;
  } | null;
};

function AppNavbar({ user }: AppNavbarProps) {
  const navigate = useNavigate();

  const navButtonClassName =
    "group inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[0.95rem] font-bold leading-none transition-all";
  const homeButtonClassName =
    `${navButtonClassName} border-vio bg-vio/12 text-vio hover:bg-vio hover:text-black`;
  const createButtonClassName =
    `${navButtonClassName} border-land bg-land text-black hover:bg-[#52ff33]`;
  const disabledButtonClassName =
    `${navButtonClassName} border-white/10 bg-white/5 text-white/35 cursor-not-allowed`;

  return (
    <nav className="w-full min-h-18 bg-black/65 backdrop-blur-md border-b border-fuchsia-500/30 px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="flex items-center gap-3 text-left"
      >
        <HyperText className="text-2xl text-white">Dev_Blog</HyperText>
      </button>

      <div className="flex flex-wrap items-center justify-end gap-3">
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
    </nav>
  );
}

export default AppNavbar;
