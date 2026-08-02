/** Release manifest files shown in the Release stage editor */
const releaseFiles = [
  { path: ".github/workflows/deploy.yml", type: "workflow" },
  { path: "backend/Dockerfile", type: "docker" },
  { path: "frontend/vercel.json", type: "config" },
  { path: "render.yaml", type: "config" },
  { path: ".env.manifest", type: "env" },
] as const;

const releaseContents: Record<string, string> = {
  ".github/workflows/deploy.yml": `name: deploy
on:
  push:
    branches: [main]
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --prefix frontend
      - run: npm ci --prefix backend
      - run: npm run build --prefix frontend
      - run: npm test --prefix backend
      - run: curl -X POST $RENDER_DEPLOY_HOOK_URL`,
  "backend/Dockerfile": `FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:8080/actuator/health
ENTRYPOINT ["java", "-jar", "app.jar"]`,
  "frontend/vercel.json": `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/api/(.*)", "destination": "https://nexuspay-api.onrender.com/$1" }]
}`,
  "render.yaml": `services:
  - type: web
    name: nexuspay-api
    env: docker
    dockerfilePath: ./backend/Dockerfile
    healthCheckPath: /actuator/health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: nexuspay-db
          property: connectionString
      - key: CORS_ALLOWED_ORIGIN
        value: https://nexuspay-frontend.vercel.app
databases:
  - name: nexuspay-db
    databaseName: nexuspay`,
  ".env.manifest": "frontend:\n  VITE_API_URL=https://nexuspay-api.onrender.com\nbackend:\n  DATABASE_URL=${DATABASE_URL}\n  CORS_ALLOWED_ORIGIN=https://nexuspay-frontend.vercel.app",
};

export { releaseFiles, releaseContents };
