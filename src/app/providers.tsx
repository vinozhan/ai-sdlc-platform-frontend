import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/app/errors/ErrorBoundary";
import { ThemeProvider } from "@/shared/theme";
import { createQueryClient } from "@/lib/query";
import { setUnauthorizedHandler } from "@/lib/http";
import { useSessionStore } from "@/store/session";
import { useUiStore } from "@/store/ui";
import { env } from "@/lib/env";

const queryClient = createQueryClient();

function ThemeBridge({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function UnauthorizedBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useSessionStore.getState().clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);
  return <>{children}</>;
}

async function startMswIfNeeded() {
  if (!env.useFixtures || !import.meta.env.DEV) return;
  try {
    const { worker } = await import("@/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  } catch {
    // MSW optional until handlers are registered
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!env.useFixtures || !import.meta.env.DEV);

  useEffect(() => {
    void startMswIfNeeded().finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UnauthorizedBridge>
          <ThemeBridge>
            <BrowserRouter>{children}</BrowserRouter>
          </ThemeBridge>
        </UnauthorizedBridge>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
