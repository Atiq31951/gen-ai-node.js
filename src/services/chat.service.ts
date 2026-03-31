import { openAI, openAiModel } from "../lib/openai";
import {
  getContext,
  deleteOlderContexts,
  addNewContext,
} from "../utils/contextManager";
import { getEnv } from "../utils/getEnv";
import { toolDefinitions, dispatchToolCall } from "../tools";

export const createChatCompletion = async (
  roomId: string,
  userInput: string,
  userName: string = "User",
): Promise<string> => {
  addNewContext(roomId, [{ role: "user", content: `[${userName}]: ${userInput}` }]);

  let response = await openAI.chat.completions.create({
    model: openAiModel,
    messages: getContext(roomId),
    tools: toolDefinitions,
    tool_choice: "auto",
  });

  if (response.choices[0].finish_reason === "tool_calls") {
    addNewContext(roomId, [
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
            arguments: toolCall.function.arguments,
          });

          const content =
            typeof result === "string"
              ? result
              : JSON.stringify(result ?? "null");
          addNewContext(roomId, [
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content,
            },
          ]);
        }
      }

      response = await openAI.chat.completions.create({
        model: openAiModel,
        messages: getContext(roomId),
      });

      addNewContext(roomId, [
        {
          role: "assistant",
          content: response.choices[0].message.content || "",
        },
      ]);
    }
  } else {
    addNewContext(roomId, [
      {
        role: "assistant",
        content: response.choices[0].message.content || "",
      },
    ]);
  }

  if (
    response.usage?.total_tokens &&
    response.usage.total_tokens > (getEnv("MAX_GPT_TOKEN") as number)
  ) {
    deleteOlderContexts(roomId);
  }

  return response.choices[0].message.content || "";
};
