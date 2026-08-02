import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { GlassCard, NexusWordmark } from "@/shared/ui";
import { LoginForm } from "./components";

export function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-300/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <GlassCard className="bg-white/80 p-5 shadow-blue-900/[0.06] hover:border-white/60 hover:shadow-xl sm:p-8 md:p-10">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mb-6 text-center sm:mb-8">
            <Link to="/" className="inline-flex justify-center">
              <NexusWordmark className="h-10 max-w-[200px] sm:h-12 sm:max-w-[220px]" />
            </Link>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900 sm:mt-6 sm:text-2xl">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your AI workspace</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-slate-400">
            Demo mode - any email and password will sign you in.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

export default Login;
