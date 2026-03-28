"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastCtx {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastCtx>({ toasts: [], toast: () => {}, dismiss: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
