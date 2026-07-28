import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * A Windows drive mounted into WSL (/mnt/c, /mnt/f, …) does not deliver inotify
 * events, so the file watcher never fires: saving a file leaves the browser on
 * the old module and even a hard reload can serve Vite's cached transform.
 * Polling is the fix, and it is only worth its CPU cost in exactly that case —
 * a dev server running on Windows, macOS or native Linux watches normally.
 */
const isWsl = process.platform === "linux" && /microsoft/i.test(os.release());
const onWindowsDrive = isWsl && __dirname.startsWith("/mnt/");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    watch: onWindowsDrive ? { usePolling: true, interval: 300, binaryInterval: 1000 } : undefined,
  },
});
