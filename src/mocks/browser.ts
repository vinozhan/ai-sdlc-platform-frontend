import { setupWorker } from "msw/browser";
import { testingHandlers } from "@/features/testing/msw";

/** Browser MSW worker — started from app/providers when VITE_USE_FIXTURES=true. */
export const worker = setupWorker(...testingHandlers);
