const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  percentage: (a, b) => (a * b) / 100,
  power: (a, b) => Math.pow(a, b),
  modulus: (a, b) => a % b,
};

export const calculatorToolSchema = {
  type: "function",
  function: {
    name: "calculate",
    description: "",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: Object.keys(operations),
          description: "Mathematical operation to perform",
        },
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      },
      required: ["operation", "a", "b"],
    },
  },
};

export const calculate = ({ operation, a, b }) => {
  console.log("calling calculator tool ...");
  if (
    typeof a !== "number" ||
    typeof b !== "number" ||
    !Number.isFinite(a) ||
    !Number.isFinite(b)
  ) {
    return {
      success: false,
      error: "Both operands must be finite numbers",
    };
  }

  const calculate = operations[operation];

  if (!calculate) {
    return {
      success: false,
      error: "Unsupported operation",
    };
  }

  if ((operation === "divide" || operation === "modulus") && b === 0) {
    return {
      success: false,
      error: "Cannot divide by zero",
    };
  }

  const result = calculate(a, b);

  if (!Number.isFinite(result)) {
    return {
      success: false,
      error: "Calculation result is not finite",
    };
  }

  return {
    success: true,
    operation,
    a,
    b,
    result,
  };
};
