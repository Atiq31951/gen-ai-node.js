import { OpenAI } from "openai";

export const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
