import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import AiAgentRouter from "../src/routes/ai.route.js";

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors()); // { origin: "http://localhost:5173" }
app.use(express.json({ limit: "16kb" }));
app.use(pinoHttp());

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Web Search Agent API is running",
  });
});

app.use("/api/v1/agent", AiAgentRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
