import { type BuildConfig, type Service } from "https://deno.land/x/railway@v3/mod.ts";

export const config: BuildConfig = {
  services: {
    CommerceFlow: {
      build: {
        builder: "nixpacks",
        buildCommand: "npm install && npx prisma generate && npm run build",
        startCommand: "npm start",
      },
    },
  },
};
