import { groqClient } from "../ai/groq.client.js";
import { env } from "../config/env.js";
import { executeTool, tools } from "../tools/registry.js";
import { systemPrompt, toolSystemPrompt } from "./prompt.js";

// sse labels
const toolLabels = {
  webSearch: "Web searching…",
  calculate: "Calculating…",
  get_current_datetime: "Checking date and time…",
};

export const runAgent = async (query, onEvent = () => {}) => {
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("A non-empty query is required");
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const dateContext = `\nCurrent date: ${today} (Asia/Kolkata).`;
  const messages = [
    {
      role: "system",
      content: toolSystemPrompt + dateContext,
    },
    {
      role: "user",
      content: query.trim(),
    },
  ];
  const maxRounds = 8;

  for (let round = 0; round < maxRounds; round++) {
    const response = await groqClient.chat.completions.create({
      model: env.GROQ_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });
    const message = response.choices?.[0]?.message;

    if (!message) {
      throw new Error("The model returned no assistant message");
    }

    if (!message.tool_calls?.length) {
      if (!message.content?.trim()) {
        throw new Error("The model returned an empty answer");
      }

      // Format the completed answer in a separate request with no tools.
      messages.push({ role: "assistant", content: message.content });
      const finalResponse = await groqClient.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              systemPrompt +
              dateContext +
              "\nNo tools are available in this final formatting stage. Return the answer directly as JSON.",
          },
          ...messages.slice(1),
          {
            role: "user",
            content:
              "Format your last answer using the required JSON structure. Preserve verified facts, sources, and limitations. Do not perform any new actions.",
          },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });
      const content = finalResponse.choices?.[0]?.message?.content;
      if (!content?.trim()) {
        throw new Error("The model returned an empty final answer");
      }

      try {
        return JSON.parse(content);
      } catch (error) {
        throw new Error("The model returned invalid JSON", { cause: error });
      }
    }

    messages.push({
      role: "assistant",
      content: message.content ?? null,
      tool_calls: message.tool_calls,
    });

    for (const call of message.tool_calls) {
      const toolName = call.function.name;
      let content;

      onEvent("tool_status", {
        id: call.id,
        tool: toolName,
        status: "running",
        message: toolLabels[toolName] ?? `Running ${toolName}…`,
      });

      try {
        const result = await executeTool(
          call.function.name,
          call.function.arguments,
        );
        content = JSON.stringify(result ?? null);
        const failed = result?.success === false;

        onEvent("tool_status", {
          id: call.id,
          tool: toolName,
          status: failed ? "failed" : "completed",
          message: failed ? `${toolName} failed` : `${toolName} finished`,
        });
      } catch (error) {
        content = JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        onEvent("tool_status", {
          id: call.id,
          tool: toolName,
          status: "failed",
          message: `${toolName} failed`,
        });
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content,
      });
    }
  }

  throw new Error(
    `Agent stopped after ${maxRounds} rounds without a final answer`,
  );
};
