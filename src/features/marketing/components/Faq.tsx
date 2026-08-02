import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { GlassCard } from "./GlassCard";

const faqs = [
  {
    q: "What file formats do you support for SRS uploads?",
    a: "We support PDF, DOCX, Markdown, and plain text. Our AI extracts structure, requirements IDs, and dependencies automatically.",
  },
  {
    q: "How long does generation take?",
    a: "Most projects complete initial architecture and code generation within 5-15 minutes, depending on document complexity and stack selection.",
  },
  {
    q: "Can we review and edit before downloading?",
    a: "Yes. Every artifact lands in your AI workspace where you can review architecture diagrams, code, tests, and deployment configs before export.",
  },
  {
    q: "Is our SRS data kept private?",
    a: "All uploads are encrypted in transit and at rest. Enterprise plans offer dedicated tenants and optional on-premise deployment.",
  },
  {
    q: "Which programming languages are supported?",
    a: "TypeScript/React, Java/Spring, Python/FastAPI, Go, C#/.NET, and more. Custom stacks can be configured on Professional and Enterprise plans.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-medium text-slate-900 md:text-base">{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-slate-600">{a}</p>}
    </div>
  );
}

export function Faq() {
  return (
    <section id="docs" className="relative bg-slate-50/80 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Common questions</h2>
        </div>
        <GlassCard className="mt-12 px-6 md:px-8">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </GlassCard>
      </div>
    </section>
  );
}
