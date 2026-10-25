import { defineConfig, devices } from "@playwright/test";

// O teste usa o mesmo Supabase do app (lê as chaves do .env.local).
process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Pixel 7"],
    locale: "pt-BR",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
