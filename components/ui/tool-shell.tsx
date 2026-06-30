interface ToolShellProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolShell({ id, eyebrow, title, description, children }: ToolShellProps) {
  return (
    <section id={id} className="glass-panel scroll-mt-24 p-6 sm:p-8">
      {/* <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div> */}
      {children}
    </section>
  );
}
