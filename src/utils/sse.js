
export const initializeSSE = (res) => {
  res.status(200);

  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.flushHeaders();
};

export const sendSSE = (res, event, data) => {
  if (res.destroyed || res.writableEnded) return false;

  return res.write(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  );
};

export const closeSSE = (res) => {
  if (!res.destroyed && !res.writableEnded) {
    res.end();
  }
};
