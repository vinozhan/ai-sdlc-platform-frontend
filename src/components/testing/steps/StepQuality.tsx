import { Activity, FileCheck, FlaskConical, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/primitives";
import { Bar, Metric, Note, Panel } from "@/components/testing/bits";
import type { Quality } from "@/data/testingData";
import type { TestingView } from "@/components/testing/view";

function TrendChart({ trend, note }: { trend: Quality["trend"]; note: string }) {
  const w = 640;
  const h = 190;
  const padL = 40;
  const padR = 46;
  const padT = 14;
  const padB = 34;
  const min = 55;
  const max = 100;

  const x = (i: number) => padL + (i * (w - padL - padR)) / Math.max(1, trend.length - 1);
  const y = (v: number) => padT + ((max - v) / (max - min)) * (h - padT - padB);

  const path = (key: "line" | "branch") => trend.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p[key])}`).join(" ");
  const last = trend[trend.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Coverage by build">
        {[60, 80, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={w - padR}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--tp-line)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text x={padL - 8} y={y(tick) + 3.5} textAnchor="end" fontSize={10} fill="var(--tp-muted)">
              {tick}%
            </text>
          </g>
        ))}

        <path d={path("branch")} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={path("line")} fill="none" stroke="#2563eb" strokeWidth={2} />

        {trend.map((p, i) => (
          <g key={p.build}>
            <title>{`Build ${p.build} — line ${p.line}%, branch ${p.branch}%`}</title>
            <circle cx={x(i)} cy={y(p.branch)} r={2.5} fill="#94a3b8" />
            <circle cx={x(i)} cy={y(p.line)} r={3} fill="#2563eb" />
            <text x={x(i)} y={h - 14} textAnchor="middle" fontSize={10} fill="var(--tp-muted)">
              {p.build}
            </text>
            <rect x={x(i) - 14} y={padT} width={28} height={h - padT - padB} fill="transparent">
              <title>{`Build ${p.build} — line ${p.line}%, branch ${p.branch}%`}</title>
            </rect>
          </g>
        ))}

        <text x={w - padR + 6} y={y(last.line) + 3.5} fontSize={11} fill="#2563eb" fontWeight={600}>
          {last.line}%
        </text>
        <text x={w - padR + 6} y={y(last.branch) + 3.5} fontSize={11} fill="var(--tp-muted)">
          {last.branch}%
        </text>
        <text x={padL} y={h - 2} fontSize={9} fill="var(--tp-muted)">
          BUILD
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="tp-den flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded-full bg-blue-600" /> line coverage
        </span>
        <span className="tp-den flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded-full bg-slate-400" /> branch coverage
        </span>
      </div>
      <Note className="mt-2 text-xs">{note}</Note>
    </div>
  );
}

export function StepQuality({ view }: { view: TestingView }) {
  const { quality } = view;
  const byModule = [...quality.byModule].sort((a, b) => a.line - b.line);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          icon={<Activity className="h-4 w-4 text-blue-400" />}
          label="Coverage"
          title="How much of the code the tests execute"
          meta={`Measured on build ${view.build}`}
        >
          <div className="space-y-5">
            <div>
              <Metric
                label="Line coverage"
                value={`${quality.line.percent}%`}
                denominator={`${quality.line.covered.toLocaleString()} of ${quality.line.total.toLocaleString()} lines`}
              />
              <div className="mt-2">
                <Bar value={quality.line.percent} />
              </div>
            </div>
            <div>
              <Metric
                label="Branch coverage"
                value={`${quality.branch.percent}%`}
                denominator={`${quality.branch.covered.toLocaleString()} of ${quality.branch.total.toLocaleString()} branches`}
              />
              <div className="mt-2">
                <Bar value={quality.branch.percent} tone="muted" />
              </div>
            </div>
            <Note className="text-xs">
              Line coverage counts lines the tests ran. Branch coverage counts the decisions inside them — the second
              number is the harder one, and the one that tells you whether the edge cases are tested.
            </Note>
          </div>
        </Panel>

        <Panel
          icon={<FlaskConical className="h-4 w-4 text-blue-400" />}
          label="Mutation testing"
          title="Small bugs planted on purpose, then the suite runs again"
          meta={quality.tool}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {quality.mutation.killed}
              </p>
              <p className="tp-label mt-0.5">Mutants killed</p>
              <p className="tp-den mt-1">the tests caught these</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                {quality.mutation.survived}
              </p>
              <p className="tp-label mt-0.5">Mutants survived</p>
              <p className="tp-den mt-1">planted bugs no test noticed</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="tp-label">Mutation score</span>
              <span className="tp-den">
                <span className="text-sm font-semibold text-[color:var(--tp-ink)]">{quality.mutation.score}%</span>{" "}
                · {quality.mutation.killed} killed ÷ {quality.mutation.total} planted
              </span>
            </div>
            <Progress value={quality.mutation.score} color="#2563eb" />
          </div>

          <div className="mt-4">
            <p className="tp-label">What survived</p>
            <ul className="mt-2 space-y-2">
              {quality.survivors.map((s) => (
                <li key={s.location} className="border-l-2 border-red-500/40 pl-3">
                  <p className="font-mono text-[11.5px]">{s.location}</p>
                  <p className="tp-prose text-[12.5px]">
                    {s.change}. {s.note}
                  </p>
                </li>
              ))}
            </ul>
            {quality.mutation.survived > quality.survivors.length && (
              <p className="tp-den mt-2">
                {quality.mutation.survived - quality.survivors.length} more survivors in the full mutation report.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel
          icon={<FileCheck className="h-4 w-4 text-blue-400" />}
          label="Coverage by module"
          title="Weakest first"
          meta="Line and branch coverage per file"
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {byModule.map((m) => (
              <li key={m.name} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
                <div className="min-w-[180px] flex-1">
                  <p className="truncate font-mono text-xs">{m.name}</p>
                  <p className="tp-den mt-0.5">
                    {m.covered.toLocaleString()} of {m.total.toLocaleString()} lines
                  </p>
                </div>
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="w-24 sm:w-32">
                    <Bar value={m.line} tone={m.line < 75 ? "caution" : "pass"} />
                  </div>
                  <span className="w-[38px] text-right text-[13px] tabular-nums">{m.line}%</span>
                  <span className="tp-den w-[86px] text-right">branch {m.branch}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
          label="Coverage by build"
          title="Where coverage has moved"
          meta="Sprint 23 into Sprint 24"
        >
          <TrendChart trend={quality.trend} note={quality.trendNote} />
        </Panel>
      </div>
    </div>
  );
}
