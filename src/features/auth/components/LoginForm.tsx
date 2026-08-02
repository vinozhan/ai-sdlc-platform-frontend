import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { Button, Field, useFieldClasses } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { useSessionStore } from "@/store/session";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useSessionStore((s) => s.login);
  const { fieldClass } = useFieldClasses();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
    navigate("/workspace");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={cn(fieldClass, "pl-10 pr-3.5")}
          />
        </div>
      </Field>

      <Field label="Password">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(fieldClass, "pl-10 pr-3.5")}
          />
        </div>
      </Field>

      <Button type="submit" variant="primary" size="lg" className="w-full gap-2 py-3 shadow-lg shadow-blue-600/25">
        <LogIn className="h-4 w-4" />
        Log In
      </Button>
    </form>
  );
}
