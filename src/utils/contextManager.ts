import { OpenAI } from "openai";
import { encoder } from "../lib/encoder";
import { systemPrompt } from "./context.content";
import { getEnv } from "./getEnv";

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

// Per-room context store
const rooms = new Map<string, Message[]>();

const getOrCreateRoom = (roomId: string): Message[] => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, [{ role: "system", content: systemPrompt }]);
  }
  return rooms.get(roomId)!;
};

export const getContext = (roomId: string): Message[] =>
  getOrCreateRoom(roomId);

export const addNewContext = (roomId: string, newContext: Message[]): void => {
  const context = getOrCreateRoom(roomId);
  context.push(...(Array.isArray(newContext) ? newContext : [newContext]));
};

const setContext = (roomId: string, newContext: Message[]): void => {
  const context = getOrCreateRoom(roomId);
  context.length = 0;
  context.push(...newContext);
};

export const getContextLength = (roomId: string): number => {
  let length = 0;
  getContext(roomId).forEach((item) => {
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

export const deleteOlderContexts = (roomId: string): void => {
  let contextLength = getContextLength(roomId);
  let pos = 0;
  const newContext: Message[] = [...getContext(roomId)];
  while (contextLength > (getEnv("MAX_GPT_TOKEN") as number)) {
    if (newContext[pos].role === "system") {
      pos++;
      continue;
    }
    newContext.splice(pos, 1);
    contextLength = getContextLength(roomId);
  }
  setContext(roomId, newContext);
};
