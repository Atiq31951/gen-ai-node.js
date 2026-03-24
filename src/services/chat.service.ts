import { OpenAI } from "openai";
import { openAI, openAiModel } from "../lib/openai";
import {
  getContext,
  deleteOlderContexts,
  addNewContext,
} from "../utils/contextManager";
import { getEnv } from "../utils/getEnv";
import { toolDefinitions, dispatchToolCall } from "../tools";

export const createChatCompletion = async (
  userInput: string,
): Promise<void> => {
  const userContext: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "user",
    content: userInput,
  };

  addNewContext([userContext]);

  let response = await openAI.chat.completions.create({
    model: openAiModel,
    messages: getContext(),
    tools: toolDefinitions,
    tool_choice: "auto",
  });

  if (response.choices[0].finish_reason === "tool_calls") {
    addNewContext([
      {
        role: "assistant",
        content: response.choices[0].message.content,
        tool_calls: response.choices[0].message.tool_calls,
      },
    ]);
  }

  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";

  if (willInvokeFunction) {
    const toolCalls = response.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        if (toolCall.type === "function") {
          const result = await dispatchToolCall({
            functionName: toolCall.function.name,
            arguments: {
              ...JSON.parse(toolCall.function.arguments),
              tool_call_id: toolCall.id,
            },
          });

          const content =
            typeof result === "string"
              ? result
              : JSON.stringify(result ?? "null");
          addNewContext([
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content,
            },
          ]);
        }

        console.log("Context", getContext());

        response = await openAI.chat.completions.create({
          model: openAiModel,
          messages: getContext(),
        });
      }
    }
  }

  console.log("willInvokeFunction ====> ", willInvokeFunction, getContext());

  if (!willInvokeFunction) {
    addNewContext([
      {
        role: "assistant",
        content: response.choices[0].message.content || "",
      },
    ]);
  }

  console.log(response.choices[0].message.content);

  if (
    response.usage?.total_tokens &&
    response.usage.total_tokens > (getEnv("MAX_GPT_TOKEN") as number)
  ) {
    deleteOlderContexts();
  }
};
