import { encoding_for_model } from "tiktoken";

export const encoder = encoding_for_model(process.env.OPENAI_MODEL);
