"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="fixed inset-x-0 top-20 z-50 mx-auto flex w-full max-w-7xl flex-col gap-3 px-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`ml-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
              : "border-rose-200 bg-rose-50/95 text-rose-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <CircleAlert className="mt-0.5 size-5 shrink-0" />
          )}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
