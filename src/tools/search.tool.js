import { tavily } from "@tavily/core";
import { env } from "../config/env.js";

const tvly = tavily({ apiKey: env.TAVILY_API_KEY });

export const SearchtoolSchema = {
  type: "function",
  function: {
    name: "webSearch",
    description: "Search the web for current information and facts.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 1,
          description: "The question or keywords to search for.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};

export const webSearch = async ({ query } = {}) => {
    console.log("calling web search tool ...")
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("A non-empty search query is required");
  }
  return tvly.search(query.trim(), { maxResults: 5 });
};
