"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { ToastViewport, type ToastMessage } from "@/components/ui/toast-viewport";

type NotificationType = ToastMessage["type"];

interface NotificationContextValue {
  notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider.");
  }

  return context;
}
