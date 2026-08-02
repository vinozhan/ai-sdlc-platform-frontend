import {
  Brain,
  Building2,
  Code2,
  Database,
  Globe,
  Layers,
  Rocket,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { FeaturesBanner, SolutionsVisual } from "./LandingVisuals";
import { GlassCard } from "./GlassCard";

const features = [
  {
    icon: Brain,
    title: "AI requirement analysis",
    description: "Parses SRS documents, extracts entities, user stories, and acceptance criteria with semantic understanding.",
  },
  {
    icon: Code2,
    title: "Automatic code generation",
    description: "Production-ready frontend, backend, and API layers generated from your specifications in minutes.",
  },
  {
    icon: Layers,
    title: "Scalable architecture",
    description: "Microservices, modular monolith, or serverless patterns - chosen and documented for your scale.",
  },
  {
    icon: Shield,
    title: "Enterprise-grade security",
    description: "SOC 2-ready processing, encrypted uploads, and isolated tenant environments for sensitive specs.",
  },
  {
    icon: Globe,
    title: "Multi-language support",
    description: "TypeScript, Java, Python, Go, C#, and more - aligned to your team's stack and conventions.",
  },
  {
    icon: Rocket,
    title: "Cloud deployment ready",
    description: "Docker, CI/CD pipelines, and infrastructure-as-code bundled for AWS, Azure, GCP, or Vercel.",
  },
  {
    icon: Database,
    title: "Database & schema design",
    description: "Normalized schemas, migrations, and ORM models generated alongside your application code.",
  },
  {
    icon: Zap,
    title: "Rapid delivery",
    description: "Compress weeks of scaffolding into hours - review, refine, and ship with full traceability.",
  },
];

const solutions = [
  {
    icon: Building2,
    title: "Enterprise IT",
    description: "Standardize delivery across portfolios with governed AI pipelines and audit trails.",
  },
  {
    icon: Users,
    title: "Software agencies",
    description: "Accelerate client projects from SRS to deployable artifacts without sacrificing quality.",
  },
  {
    icon: Rocket,
    title: "Product teams",
    description: "Prototype full-stack applications from requirements documents before sprint planning.",
  },
];

export function ValueProp() {
  return (
    <>
      <section id="features" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Everything you need to go from spec to ship
            </h2>
            <p className="mt-4 text-slate-600">
              Enterprise-grade AI capabilities designed for teams that can't compromise on quality or speed.
            </p>
          </div>
          <FeaturesBanner />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <GlassCard key={f.title} className="relative overflow-hidden p-6 transition-all hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent transition-all group-hover:via-blue-500/80" />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/10 to-blue-400/5 ring-1 ring-blue-100">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="relative bg-slate-50/80 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Solutions</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Built for how you deliver software</h2>
          </div>
          <SolutionsVisual />
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {solutions.map((s) => (
              <GlassCard key={s.title} className="p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-600/20">
                  <s.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
