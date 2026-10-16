import Groq from "groq-sdk";
import { env } from "../config/env.js";

const apiKey = env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing in environment variables");
}
// client
export const groqClient = new Groq({
  apiKey,
  maxRetries: 2,
  timeout: 30000,
});