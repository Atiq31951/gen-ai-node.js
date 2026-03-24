import { OpenAI } from "openai";

import { dateTimeTools } from "./schemas/date";
import { orderTools } from "./schemas/order";

export type ToolSlice = {
  definition: OpenAI.Chat.Completions.ChatCompletionTool;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
};

// ---- নতুন tools add করতে এখানে spread করো ----
const allTools: ToolSlice[] = [
  ...dateTimeTools,
  ...orderTools,
  // ...productTools,
];
// ------------------------------------------------

export const toolDefinitions = allTools.map((t) => t.definition);

const registry = new Map(
  allTools.map((t) => [
    (t.definition as { type: "function"; function: { name: string } }).function
      .name,
    t.handler,
  ]),
);

export const dispatchToolCall = async (payload: {
  functionName: string;
  arguments: string;
}): Promise<unknown> => {
  const handler = registry.get(payload.functionName);
  if (!handler) {
    throw new Error(`Unknown tool: "${payload.functionName}"`);
  }
  return handler(JSON.parse(payload.arguments));
};
