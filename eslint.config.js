import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/**
 * Layer boundaries:
 *   app → features → shared / lib / types / store / entities
 *   features never import other features (relative imports within a feature)
 *   shared / lib / entities never import features or app
 *   Prefer shared area barrels; retired deep paths are hard errors.
 */
const sharedRetiredDeepPaths = [
  {
    name: "@/shared/ui/PhaseSectionHeader",
    message: "Import PhaseSectionHeader from @/shared/ui; getPhaseProgress from @/shared/model.",
  },
  {
    name: "@/shared/viz/MermaidDiagram",
    message: "Import MermaidDiagram from @/shared/viz.",
  },
  {
    name: "@/shared/viz/MermaidDiagramImpl",
    message: "Do not import MermaidDiagramImpl; use @/shared/viz.",
  },
  {
    name: "@/shared/hooks/useEditorTabs",
    message: "Import useEditorTabs from @/shared/hooks.",
  },
  {
    name: "@/shared/model/phaseProgress",
    message: "Import getPhaseProgress from @/shared/model.",
  },
];

export default tseslint.config(
  { ignores: ["dist", "e2e", "coverage", "scripts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: sharedRetiredDeepPaths,
          patterns: [
            {
              group: ["@/features/*", "@/features/*/*", "@/features/*/**"],
              message:
                "Features must not import via @/features/*. Use relative imports within the feature, or compose in app/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: sharedRetiredDeepPaths,
          patterns: [
            {
              group: ["@/features/*/*", "@/features/*/**"],
              message:
                "Import features only through their public barrel (@/features/<name>), not deep paths.",
            },
          ],
        },
      ],
    },
  },
  {
    // MSW bootstrap may import feature msw entry points (not page barrels).
    files: ["src/mocks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/fixtures/*", "@/features/*/fixtures/**", "@/features/*/components/**"],
              message: "Mocks should import via @/features/<name>/msw (or the feature public barrel).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/*/*", "@/features/*/**", "@/app/*", "@/app/*/*"],
              message: "shared/, lib/, and entities/ must not import features or app.",
            },
          ],
        },
      ],
    },
  },
);
