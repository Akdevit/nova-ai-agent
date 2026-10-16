import { runAgent } from "../agents/agent.js";
import { initializeSSE, sendSSE, closeSSE } from "../utils/sse.js";

export const RunAiAgent = async (req, res) => {
  const { query } = req.body ?? {};

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  initializeSSE(res);

  const heartbeat = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) {
      res.write(": ping\n\n");
    }
  }, 15000);

  res.once("close", () => {
    clearInterval(heartbeat);
  });

  try {
    const result = await runAgent(query.trim(), (event, data) => {
      sendSSE(res, event, data);
    });

    sendSSE(res, "result", result);

    sendSSE(res, "done", {
      completed: true,
    });
  } catch (error) {
    console.error("AI Agent Error:", error);

    sendSSE(res, "app_error", {
      message: "Failed to execute AI agent.",
    });
  } finally {
    clearInterval(heartbeat);
    closeSSE(res);
  }
};
