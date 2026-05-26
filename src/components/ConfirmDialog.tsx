"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type Resolver = (value: boolean) => void;

const ConfirmContext = createContext<
  ((opts: ConfirmOptions | string) => Promise<boolean>) | null
>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((input: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOpts(typeof input === "string" ? { message: input } : input);
    });
  }, []);

  function handleClose(value: boolean) {
    setOpts(null);
    const r = resolverRef.current;
    resolverRef.current = null;
    if (r) r(value);
  }

  // Esc to cancel
  useEffect(() => {
    if (!opts) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose(false);
      if (e.key === "Enter") handleClose(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="relative card max-w-sm w-full p-6 reveal is-visible">
            {opts.title && (
              <h3 className="font-bold text-lg text-slate-900 mb-1.5">{opts.title}</h3>
            )}
            <p className="text-slate-700 text-sm">{opts.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="btn-outline px-5 py-2"
              >
                {opts.cancelText ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                autoFocus
                className={
                  opts.destructive
                    ? "btn bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] px-5 py-2"
                    : "btn-primary px-5 py-2"
                }
              >
                {opts.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}
