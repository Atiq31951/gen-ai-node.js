import { encoding_for_model, TiktokenModel } from "tiktoken";
import { getEnv } from "../utils/getEnv";

export const encoder = encoding_for_model(getEnv("OPENAI_MODEL") as TiktokenModel);
