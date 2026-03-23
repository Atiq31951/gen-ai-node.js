import { OpenAI } from "openai";
import { encoder } from "../lib/encoder";
import { systemPrompt } from "./context.content";
import { getEnv } from "./getEnv";

export const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: systemPrompt,
  },
];

export const getContextLength = (): number => {
  let length = 0;
  context.forEach((item) => {
    if (typeof item.content === "string") {
      length += encoder.encode(item.content).length;
    } else if (Array.isArray(item.content)) {
      item.content.forEach((content) => {
        if (content.type === "text") {
          length += encoder.encode(content.text).length;
        }
      });
    }
  });
  return length;
};

export const deleteOlderContexts = (): void => {
  let contextLength = getContextLength();
  let pos = 0;
  while (contextLength > (getEnv("MAX_GPT_TOKEN") as number)) {
    if (context[pos].role === "system") {
      pos++;
      continue;
    }
    context.splice(pos, 1);
    contextLength = getContextLength();
  }
};
