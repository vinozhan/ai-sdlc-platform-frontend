import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { GlassCard } from "./GlassCard";

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

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
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
  );
}
