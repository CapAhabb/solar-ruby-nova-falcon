import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { downloadKnowledgeJson, downloadKnowledgeMarkdown } from "@/lib/export-kb";
import {
  articles,
  articlesIn,
  domains,
  findArticle,
  searchArticles,
  type DomainId,
} from "@/lib/kb";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [domain, setDomain] = useState<DomainId | "all">("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("phone-boundaries");

  const list = useMemo(() => {
    const base = query.trim()
      ? searchArticles(query)
      : domain === "all"
        ? articles
        : articlesIn(domain);
    if (query.trim() && domain !== "all") {
      return base.filter((a) => a.domain === domain);
    }
    return base;
  }, [domain, query]);

  const active = findArticle(activeId) ?? list[0];

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">Careline telephone desk</p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-fg sm:text-4xl">
              Telephone agent knowledge
            </h1>
            <p className="mt-1 max-w-xl text-muted">
              Voice only. Every answer still has to pass four rails: boundary, authority, source of truth, and call security.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-80">
            <label className="block">
              <span className="sr-only">Search articles</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search copay, refill, no-show…"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-3 text-base text-fg outline-none ring-primary focus:ring-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadKnowledgeMarkdown}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-fg"
              >
                Download manual
              </button>
              <button
                type="button"
                onClick={downloadKnowledgeJson}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-fg"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-3 py-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:bg-transparent lg:px-4 lg:py-6">
          <FilterChip
            label={`All · ${articles.length}`}
            selected={domain === "all"}
            onClick={() => setDomain("all")}
          />
          {domains.map((d) => (
            <FilterChip
              key={d.id}
              label={d.name}
              hint={d.blurb}
              selected={domain === d.id}
              onClick={() => setDomain(d.id)}
            />
          ))}
        </nav>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,280px)_1fr]">
          <ul className="max-h-[40vh] overflow-auto border-b border-border lg:max-h-none lg:border-b-0 lg:border-r">
            {list.length === 0 && (
              <li className="px-4 py-8 text-muted">No articles match that search.</li>
            )}
            {list.map((a) => {
              const on = a.id === active?.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(a.id)}
                    className={`w-full border-l-4 px-4 py-3 text-left ${
                      on
                        ? "border-primary bg-surface"
                        : "border-transparent hover:bg-surface-2"
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                      {domains.find((d) => d.id === a.domain)?.name}
                    </span>
                    <span className="mt-0.5 block font-medium text-fg">{a.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {active && (
            <article className="bg-surface px-4 py-6 sm:px-8 sm:py-8">
              <p className="text-sm text-muted">Reviewed {active.reviewed}</p>
              <h2 className="mt-1 font-serif text-3xl font-medium tracking-tight">{active.title}</h2>
              <p className="mt-3 max-w-2xl text-lg text-fg">{active.summary}</p>
              <p className="mt-4 rounded-md border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="font-semibold text-primary">Source of truth. </span>
                {active.tool}
              </p>
              {active.domain !== "phone" && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {rails.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(r.id)}
                        className="h-full w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-left hover:border-primary"
                      >
                        <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                          {r.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-fg">{r.line}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <RuleList title="May" items={active.may} tone="ok" />
              <RuleList title="Must not" items={active.mustNot} tone="warn" />
              <RuleList title="Say this" items={active.say} tone="plain" />
              <div className="mt-4 flex flex-wrap gap-2">
                {active.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-sm bg-surface-2 px-2 py-1 text-sm text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {active.escalate && (
                <p className="mt-5 rounded-md border border-warn/30 bg-warn-bg px-4 py-3 text-warn">
                  <span className="font-semibold">Escalation. </span>
                  {active.escalate}
                </p>
              )}
              <div className="mt-8 space-y-8">
                {active.sections.map((s) => (
                  <section key={s.heading}>
                    <h3 className="font-serif text-xl font-medium">{s.heading}</h3>
                    <ul className="mt-2 space-y-2">
                      {s.body.map((line) => (
                        <li key={line} className="border-l border-border pl-3 text-fg">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="mt-10 border-t border-border pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Related</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.related.map((id) => {
                    const rel = findArticle(id);
                    if (!rel) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveId(id)}
                        className="rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-sm font-medium text-primary hover:border-primary"
                      >
                        {rel.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

function RuleList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "ok" | "warn" | "plain";
}) {
  const box =
    tone === "ok"
      ? "border-ok/30 bg-ok-bg"
      : tone === "warn"
        ? "border-warn/30 bg-warn-bg"
        : "border-border bg-surface";
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <ul className={`mt-2 space-y-2 rounded-md border px-4 py-3 ${box}`}>
        {items.map((line) => (
          <li key={line} className="text-fg">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

const rails = [
  {
    id: "phone-boundaries",
    label: "Boundary",
    line: "Speak and commit only what the telephone tools allow.",
  },
  {
    id: "phone-authority",
    label: "Authority",
    line: "Verified patient or listed contact. Tools commit; the caller does not.",
  },
  {
    id: "phone-source",
    label: "Source of truth",
    line: "Live system first, this base second, caller memory last.",
  },
  {
    id: "phone-security",
    label: "Security",
    line: "Verify before disclosure. No card numbers on the line.",
  },
];

function FilterChip({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-3 py-2 text-left lg:w-full ${
        selected ? "bg-primary text-primary-fg" : "bg-surface text-fg hover:bg-surface-2"
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      {hint && (
        <span className={`mt-0.5 hidden text-xs lg:block ${selected ? "text-primary-fg/80" : "text-muted"}`}>
          {hint}
        </span>
      )}
    </button>
  );
}
