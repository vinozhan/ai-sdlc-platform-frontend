/**
 * Route-level error UI (404 / failed lazy import). Wire from app/routes.tsx.
 */

export function RouteError({ message = "Page not found." }: { message?: string }) {
  return <p>{message}</p>;
}
