import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const encoder = encoding_for_model(process.env.OPENAI_MODEL);

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "We are an e-commerce company. You are my Customer support agent who knows about the products and services.\n" +
      "Help the customer respond to the users what asks about the products and services or any query related to the products and services.",
  },
];

const createChatCompletion = async (userInput: string) => {
  const userContext: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "user",
    content: userInput,
  };
  const response = await openAI.chat.completions.create({
    model: openAiModel,
    messages: [...context, userContext],
  });

  context.push(userContext);

  const assistantContext: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "assistant",
    content: response.choices[0].message.content || "",
  };
  context.push(assistantContext);

  console.log(response.choices[0].message.content);

  if (
    response.usage?.total_tokens &&
    response.usage.total_tokens > parseInt(process.env.MAX_GPT_TOKEN)
  ) {
    deleteOderContexts();
  }
};

const deleteOderContexts = () => {
  let contextLength = getContextLength();

  let pos = 0;
  while (contextLength > parseInt(process.env.MAX_GPT_TOKEN || "0")) {
    if (context[pos].role === "system") {
      pos++;
      continue;
    }
    context.splice(pos, 1);
    contextLength = getContextLength();
  }
};

const getContextLength = () => {
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

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();
  if (userInput === "exit") {
    process.exit(0);
  }

  await createChatCompletion(userInput);
});
