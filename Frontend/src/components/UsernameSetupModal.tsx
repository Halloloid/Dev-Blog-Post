import { useState } from "react";
import api from "@/config/api";
import { useToast } from "./ui/toast";

type UsernameSetupModalProps = {
  onSuccess: (username: string) => void;
};

const USERNAME_REGEX = /^[a-z0-9._]{3,20}$/;

function UsernameSetupModal({ onSuccess }: UsernameSetupModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      setError("Use 3-20 lowercase letters, numbers, dots, or underscores.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api.post(
        "/api/users/create",
        { username: normalizedUsername },
        { withCredentials: true }
      );

      toast({
        title: "Username created",
        description: `You are now @${normalizedUsername}`,
      });

      onSuccess(normalizedUsername);
    } catch (submitError: any) {
      const message =
        submitError?.response?.data?.message ?? "Unable to create username right now.";
      setError(message);
      toast({
        title: "Username setup failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-fuchsia-500/30 bg-[#09040d] p-6">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300/70">
            One More Step
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Create your username</h2>
          <p className="mt-2 text-sm text-white/65">
            This shows on your profile and post pages. Returning users with a username will not
            see this again.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-fuchsia-200">
              Username
            </label>
            <div className="flex items-center rounded-xl border border-fuchsia-500/30 bg-black/40 px-3">
              <span className="text-sm text-fuchsia-300/80">@</span>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your.name"
                autoComplete="off"
                className="w-full bg-transparent px-2 py-3 text-white outline-none placeholder:text-white/25"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-2 text-xs text-white/45">
              Allowed: lowercase letters, numbers, dots, underscores.
            </p>
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-fuchsia-500 px-4 py-3 font-semibold text-black transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Save Username"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UsernameSetupModal;
