export type FlowLink = {
  id: string;
  label: string;
  targetId: string;
  variant?: "primary" | "secondary" | "row" | "text";
};

export type FlowScreen = {
  id: string;
  name: string;
  breadcrumb: string[];
  links: FlowLink[];
};

export type WireframeFlow = {
  id: string;
  wireframeKey: string;
  defaultVersion: string;
  appName: string;
  screens: FlowScreen[];
};

export const wireframeFlows: WireframeFlow[] = [
  {
    id: "payflow-checkout",
    wireframeKey: "Payment Form",
    defaultVersion: "updated sprint 2",
    appName: "PayFlow",
    screens: [
      {
        id: "products",
        name: "Products",
        breadcrumb: ["PayFlow", "Products"],
        links: [
          { id: "add-premium", label: "Add Premium Plan — $49/mo", targetId: "cart", variant: "row" },
          { id: "add-basic", label: "Add Basic Plan — $19/mo", targetId: "cart", variant: "row" },
          { id: "view-cart", label: "View cart (2)", targetId: "cart", variant: "primary" },
        ],
      },
      {
        id: "cart",
        name: "Cart",
        breadcrumb: ["PayFlow", "Products", "Cart"],
        links: [
          { id: "item-1", label: "Premium Plan × 1 — $49.00", targetId: "cart", variant: "row" },
          { id: "item-2", label: "Basic Plan × 1 — $19.00", targetId: "cart", variant: "row" },
          { id: "checkout", label: "Proceed to checkout", targetId: "checkout", variant: "primary" },
          { id: "continue", label: "Continue shopping", targetId: "products", variant: "secondary" },
        ],
      },
      {
        id: "checkout",
        name: "Checkout",
        breadcrumb: ["PayFlow", "Products", "Cart", "Checkout"],
        links: [
          { id: "pay", label: "Pay $68.00", targetId: "confirmation", variant: "primary" },
          { id: "back-cart", label: "Back to cart", targetId: "cart", variant: "secondary" },
        ],
      },
      {
        id: "confirmation",
        name: "Confirmation",
        breadcrumb: ["PayFlow", "Confirmation"],
        links: [
          { id: "dashboard", label: "Go to dashboard", targetId: "products", variant: "primary" },
        ],
      },
    ],
  },
  {
    id: "login-flow",
    wireframeKey: "Login",
    defaultVersion: "v1",
    appName: "PayFlow",
    screens: [
      {
        id: "login",
        name: "Login",
        breadcrumb: ["PayFlow", "Login"],
        links: [
          { id: "sign-in", label: "Sign in", targetId: "dashboard", variant: "primary" },
          { id: "forgot", label: "Forgot password?", targetId: "login", variant: "text" },
        ],
      },
      {
        id: "dashboard",
        name: "Dashboard",
        breadcrumb: ["PayFlow", "Dashboard"],
        links: [
          { id: "products", label: "Browse products", targetId: "login", variant: "primary" },
        ],
      },
    ],
  },
  {
    id: "kyc-flow",
    wireframeKey: "KYC Upload",
    defaultVersion: "v1",
    appName: "PayFlow",
    screens: [
      {
        id: "upload",
        name: "KYC Upload",
        breadcrumb: ["PayFlow", "Verification"],
        links: [
          { id: "upload-btn", label: "Upload ID document", targetId: "review", variant: "primary" },
        ],
      },
      {
        id: "review",
        name: "Under Review",
        breadcrumb: ["PayFlow", "Verification", "Review"],
        links: [
          { id: "done", label: "Return to dashboard", targetId: "upload", variant: "secondary" },
        ],
      },
    ],
  },
];

export const defaultWireframeCards = [
  "Login",
  "Dashboard",
  "Payment Form",
  "KYC Upload",
  "Confirmation",
  "Admin Review",
];

export function getFlowForWireframe(name: string): WireframeFlow {
  const found = wireframeFlows.find((f) => f.wireframeKey === name);
  if (found) return found;
  return {
    id: `flow-${name.toLowerCase().replace(/\s+/g, "-")}`,
    wireframeKey: name,
    defaultVersion: "v1",
    appName: "PayFlow",
    screens: [
      {
        id: "main",
        name,
        breadcrumb: ["PayFlow", name],
        links: [{ id: "next", label: "Continue", targetId: "main", variant: "primary" }],
      },
    ],
  };
}
