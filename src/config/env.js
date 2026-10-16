import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GROQ_MODEL: z.string().min(1, "GROQ_MODEL is required"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    z.treeifyError(result.error),
  );

  process.exit(1);
}

export const env = Object.freeze(result.data);
