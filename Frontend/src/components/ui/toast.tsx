import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "error";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 3000, ...options }: ToastOptions) => {
      const id = createId();
      setToasts((prev) => [...prev, { id, duration, ...options }]);

      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 top-4 z-[9999] flex max-w-[320px] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={`rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all ${
              toastItem.variant === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-100"
                : "border-blue/30 bg-black/80 text-white"
            }`}
          >
            <p className="text-sm font-semibold">{toastItem.title}</p>
            {toastItem.description && (
              <p className="text-xs text-white/70">{toastItem.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
