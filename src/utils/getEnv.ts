export const getEnv = (key: string) =>
  ({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    MAX_GPT_TOKEN: parseInt(process.env.MAX_GPT_TOKEN ?? "0"),
  })[key];
