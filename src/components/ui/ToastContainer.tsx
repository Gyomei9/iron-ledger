"use client";
import { useToast } from "@/hooks/useToast";

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
