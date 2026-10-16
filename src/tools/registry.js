import { calculate, calculatorToolSchema } from "./calculator.tool.js";
import { datetimeToolSchema, get_current_datetime } from "./datetime.tool.js";
import { SearchtoolSchema, webSearch } from "./search.tool.js";

export const tools = [
  SearchtoolSchema,
  datetimeToolSchema,
  calculatorToolSchema,
];

export const toolRegistry = { webSearch, get_current_datetime, calculate };

export const executeTool = async (name, args) => {
  if (!Object.hasOwn(toolRegistry, name)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const input = typeof args === "string" ? JSON.parse(args) : args;
  return toolRegistry[name](input);
};
