import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  LogIn,
  ArrowRight,
  ChevronDown,
  Brain,
  Code2,
  Database,
  Layers,
  Shield,
  Globe,
  Zap,
  CheckCircle2,
  Building2,
  Users,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { HeroVisual } from "@/components/landing/HeroVisual";
import {
  FeaturesBanner,
  WorkflowPipeline,
  SolutionsVisual,
  TestimonialsPattern,
  CtaVisual,
} from "@/components/landing/LandingVisuals";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Documentation", href: "#docs" },
  { label: "Contact", href: "#contact" },
];

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

const steps = [
  {
    step: "01",
    title: "Upload SRS",
    description: "Drop your Software Requirements Specification - PDF, Word, or Markdown supported.",
    icon: Upload,
  },
  {
    step: "02",
    title: "AI generates solution",
    description: "Architecture, code, database, APIs, and deployment configs are built automatically.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Review & download",
    description: "Inspect artifacts in your workspace, approve changes, and export a deployment-ready bundle.",
    icon: CheckCircle2,
  },
];

const testimonials = [
  {
    quote: "We cut our initial scaffolding phase from three weeks to two days. The architecture output alone saved our architects dozens of hours.",
    name: "Sarah Mitchell",
    role: "VP Engineering",
    company: "Nexus Financial",
  },
  {
    quote: "Uploading an SRS and getting a full project structure with traceability back to requirements changed how we pitch and deliver client work.",
    name: "James Okonkwo",
    role: "CTO",
    company: "Vertex Software Labs",
  },
  {
    quote: "Enterprise security was non-negotiable. SDLC AI met our compliance review while delivering faster than any internal tool we've built.",
    name: "Elena Vasquez",
    role: "Director of Platform",
    company: "Meridian Health Systems",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    description: "For small teams exploring AI-assisted delivery",
    features: ["5 SRS uploads / month", "Single language stack", "Community support", "Standard deployment templates"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "/month",
    description: "For software firms shipping client projects at scale",
    features: [
      "Unlimited SRS uploads",
      "Multi-language & multi-repo",
      "Priority support",
      "Custom CI/CD pipelines",
      "Team workspace & RBAC",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large IT organizations with advanced governance needs",
    features: [
      "Dedicated environment",
      "SSO & SAML",
      "On-premise option",
      "SLA & dedicated CSM",
      "Custom model fine-tuning",
    ],
    highlighted: false,
  },
];

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

function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-blue-900/[0.04] backdrop-blur-xl",
        "transition-all duration-300 hover:border-blue-200/60 hover:shadow-2xl hover:shadow-blue-900/[0.06]",
        className
      )}
    >
      {children}
    </div>
  );
}

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

export function Landing() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="landing-page min-h-screen bg-white text-slate-900">
      <LandingBackground />

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-600/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              SDLC<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/projects/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              <Upload className="h-4 w-4" />
              Upload SRS
            </button>
          </div>

          <button className="lg:hidden" onClick={() => setMobileNav(!mobileNav)} aria-label="Menu">
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileNav && (
          <div className="border-t border-slate-200/80 bg-white/95 px-6 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNav(false)}
                  className="text-sm font-medium text-slate-700"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-slate-200" />
              <button onClick={() => navigate("/login")} className="text-left text-sm font-medium text-slate-700">
                Log In
              </button>
              <button
                onClick={() => navigate("/projects/new")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                <Upload className="h-4 w-4" />
                Upload SRS
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-medium text-blue-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Software Development Platform
            </div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
              From SRS document to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                production-ready software
              </span>{" "}
              in minutes
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Upload your Software Requirements Specification and let AI analyze, architect, and generate complete
              applications - frontend, backend, database, APIs, and deployment-ready files - automatically.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("/projects/new")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
              >
                <Upload className="h-4 w-4" />
                Upload SRS
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-blue-50/50"
              >
                <LogIn className="h-4 w-4" />
                Log In to Workspace
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Trusted by IT companies, software development firms, and enterprise teams worldwide.
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative mt-12 lg:mt-0">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24 lg:px-8">
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

      {/* Solutions */}
      <section id="solutions" className="relative bg-slate-50/80 px-6 py-24 lg:px-8">
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

      {/* Workflow */}
      <section className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Three steps to a complete solution</h2>
          </div>
          <WorkflowPipeline />
          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent md:block" />
            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
                  <s.icon className="h-7 w-7 text-blue-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Step {s.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-[#1e3a8a] px-6 py-24 lg:px-8">
        <TestimonialsPattern />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Trusted by engineering leaders
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl"
              >
                <p className="text-sm leading-relaxed text-blue-50">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 border-t border-white/20 pt-6">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-blue-200">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Plans that scale with your team</h2>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <GlassCard
                key={plan.name}
                className={cn(
                  "flex flex-col p-8",
                  plan.highlighted && "ring-2 ring-blue-600 ring-offset-2"
                )}
              >
                {plan.highlighted && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.name === "Enterprise" ? "#contact" : "/workspace")}
                  className={cn(
                    "mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    plan.highlighted
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500"
                      : "border border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50"
                  )}
                >
                  {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="docs" className="relative bg-slate-50/80 px-6 py-24 lg:px-8">
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

      {/* CTA */}
      <section className="relative px-6 py-24 lg:px-8">
        <GlassCard className="relative mx-auto max-w-4xl overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-[#1e3a8a] p-12 text-center">
          <CtaVisual />
          <h2 className="text-3xl font-semibold text-white md:text-4xl">Ready to transform your delivery pipeline?</h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Upload your first SRS today and see a complete application generated in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/projects/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
            >
              <Upload className="h-4 w-4" />
              Upload SRS
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Log In
            </button>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-900 px-6 py-16 text-slate-400 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">SDLC AI</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              AI-powered software development from requirements to deployment-ready code.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              {["Features", "Solutions", "Pricing", "Documentation"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About", "Careers", "Contact", "Privacy"].map((l) => (
                <li key={l}>
                  <a href="#contact" className="hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Contact</h4>
            <p className="text-sm">hello@sdlc-ai.com</p>
            <p className="mt-2 text-sm">+1 (800) 555-0199</p>
            <p className="mt-2 text-sm">San Francisco, CA</p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-800 pt-8 text-center text-sm">
          © {new Date().getFullYear()} SDLC AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
