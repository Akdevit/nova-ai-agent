import { env } from "../config/env.js";

export const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err?.name === "ZodError" ? 400 : (err?.statusCode ?? err?.status);
  const statusCode = Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : 500;

  let message = err?.message || "Internal server error";
  if (err?.type === "entity.parse.failed") {
    message = "Invalid JSON request body";
  } else if (err?.type === "entity.too.large") {
    message = "Request body is too large";
  } else if (err?.name === "ZodError") {
    message = "Invalid request data";
  } else if (env.NODE_ENV === "production" && statusCode >= 500) {
    message = "Internal server error";
  }

  req.log?.error({ statusCode, message: err?.message }, "Request failed");

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: message,
  });
};
