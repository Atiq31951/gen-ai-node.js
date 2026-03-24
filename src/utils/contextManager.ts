import { OpenAI } from "openai";
import { encoder } from "../lib/encoder";
import { systemPrompt } from "./context.content";
import { getEnv } from "./getEnv";

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: systemPrompt,
  },
];

export const getContext = () => context;

export const addNewContext = (
  newContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
) => {
  context.push(...(Array.isArray(newContext) ? newContext : [newContext]));
};

const setContext = (
  newContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
) => {
  // clearing the context
  context.length = 0;
  context.push(...newContext);
};

export const getContextLength = (): number => {
  let length = 0;
  getContext().forEach((item) => {
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
  const newContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [...getContext()];
  while (contextLength > (getEnv("MAX_GPT_TOKEN") as number)) {
    console.log("Deleting older contexts", newContext[pos]);
    if (newContext[pos].role === "system") {
      pos++;
      continue;
    }
    newContext.splice(pos, 1);
    contextLength = getContextLength();
  }
  setContext(newContext);
};
