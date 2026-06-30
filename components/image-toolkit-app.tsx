import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Wand2, Zap } from "lucide-react";

import { SiteShell } from "@/components/ui/site-shell";
import { toolRoutes } from "@/lib/tool-routes";

const heroStats = [
  { label: "100% browser-side", value: "Private by design" },
  { label: "Zero backend", value: "No uploads or APIs" },
  { label: "Large files", value: "Up to 50MB" },
];

export default function ImageToolkitApp() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 sm:pb-14 sm:pt-16">
        <div className="glass-panel relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="animate-fadeUp">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-600">
                <Sparkles className="size-4" />
                Premium browser-side image editing
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950">
                Image Toolkit
              </h1>
              <p className="mt-5 max-w-2xl text-md leading-7 text-slate-600">
                Browse a simpler multi-page toolkit for compression, conversion, resize, crop, metadata, and bulk ZIP
                export while keeping every image operation fully local to the browser.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/compress" className="button-primary">
                  Open compressor
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/bulk" className="button-secondary">
                  Open bulk conversion
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 animate-float sm:grid-cols-2">
              <div className="glass-card p-5">
                <Shield className="size-6 text-emerald-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Private by default</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  No backend, no cloud storage, no auth, and no image uploads. Processing stays on-device.
                </p>
              </div>
              <div className="glass-card p-5">
                <Zap className="size-6 text-cyan-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Simpler navigation</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Each workflow now lives on its own route so the interface is easier to scan and use.
                </p>
              </div>
              <div className="glass-card p-5 sm:col-span-2">
                <Wand2 className="size-6 text-indigo-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Focused tool pages</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open one task at a time instead of scrolling through every tool on a single long page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">Tools</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Choose a workflow</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {toolRoutes.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card group flex flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:shadow-float"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">{tool.eyebrow}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{tool.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                Open page
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
