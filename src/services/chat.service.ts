import { OpenAI } from "openai";
import { openAI, openAiModel } from "../lib/openai";
import { context, deleteOlderContexts } from "../utils/contextManager";
import { getEnv } from "../utils/getEnv";

export const createChatCompletion = async (
  userInput: string,
): Promise<void> => {
  const userContext: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "user",
    content: userInput,
  };

  const response = await openAI.chat.completions.create({
    model: openAiModel,
    messages: [...context, userContext],
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeDate",
          description: "Get the current time",
          parameters: {
            type: "object",
            properties: {
              timezone: {
                type: "string",
                description: "The timezone to get the current time for",
              },
              agoDay: {
                type: "number",
                description: "The number of days ago to get the time for",
              },
            },
            required: [],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";

  if (willInvokeFunction) {
    const toolCalls = response.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const firstToolCall = toolCalls[0];
      if (firstToolCall.type === 'function') {
        const functionName = firstToolCall.function.name;
        const functionArgs = firstToolCall.function.arguments;

        
      }
    }
  }

  context.push(userContext);

  const assistantContext: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "assistant",
    content: response.choices[0].message.content || "",
  };
  context.push(assistantContext);

  console.log(response.choices[0].message.content);

  if (
    response.usage?.total_tokens &&
    response.usage.total_tokens > (getEnv("MAX_GPT_TOKEN") as number)
  ) {
    deleteOlderContexts();
  }
};
