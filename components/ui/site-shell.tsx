"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { toolRoutes } from "@/lib/tool-routes";
import Image from 'next/image';


const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  return (
    <main className="relative overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={`${basePath}/images/logo.png`}
              alt="Image Toolkit"
              title="Image Toolkit"
              width={256}
              height={67}
              priority
            />
            {/* <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 px-3 py-2 text-sm font-bold text-white shadow-float">
              IT
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-indigo-500">Image Toolkit</p>
              <p className="text-sm text-slate-500">Private browser-only image workflows</p>
            </div> */}
          </Link>

          <nav className="hidden items-center gap-3 lg:flex">
            {/* <Link
              href="/"
              className={`text-sm font-medium transition ${pathname === "/" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Home
            </Link> */}
            {toolRoutes.slice(0, 7).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`text-sm font-medium transition ${
                  pathname === tool.href ? "text-slate-900 text-cyan-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tool.title}
              </Link>
            ))}
          </nav>

          {/* <Link href="/compress" className="button-primary hidden lg:block">
            Open tools
          </Link> */}
        </div>
      </header>

      {children}

      <footer className="border-t border-white/60 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>@copyright {new Date().getFullYear()} Image Toolkit</p>
          <div className="flex flex-wrap gap-4">
            <div>Designed and developed by Mohd Salman</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
