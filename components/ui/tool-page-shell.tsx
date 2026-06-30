"use client";

import { NotificationProvider } from "@/components/ui/notification-provider";
import { SiteShell } from "@/components/ui/site-shell";

interface ToolPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolPageShell({ eyebrow, title, description, children }: ToolPageShellProps) {
  return (
    <NotificationProvider>
      <SiteShell>
        <section className="mx-auto max-w-7xl px-6 pb-8 pt-10">
          <div className="glass-panel relative overflow-hidden p-8">
            <div className="absolute inset-0 bg-mesh opacity-80" />
            <div className="relative max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 pb-20">{children}</section>
      </SiteShell>
    </NotificationProvider>
  );
}
