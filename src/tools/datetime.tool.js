export const datetimeToolSchema = {
  type: "function",
  function: {
    name: "get_current_datetime",
    description: "Get the current date, time, day, and timezone information.",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description:
            "IANA timezone, e.g. Asia/Kolkata, UTC, America/New_York",
        },
      },
    },
    required: [],
  },
};

export const get_current_datetime = ({ timezone = "Asia/Kolkata" } = {}) => {
  console.log("calling date & time tool ...");
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    return {
      success: true,
      timezone,
      datetime: formatter.format(now),
      iso: now.toISOString(),
      timestamp: now.getTime(),
    };
  } catch {
    return {
      success: false,
      error: "Invalid timezone",
    };
  }
};
