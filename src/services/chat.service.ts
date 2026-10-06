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

  let response;
  try {
    response = await openAI.chat.completions.create({
      model: openAiModel,
      messages: getContext(roomId),
      tools: toolDefinitions,
      tool_choice: "auto",
    });
  } catch (apiError: any) {
    console.warn(`[OpenAI Mock/Fallback Activated] Reason: ${apiError?.message || apiError}`);

    // Simulate tool call based on user query
    let toolName: string | null = null;
    let toolArgs: Record<string, unknown> = {};

    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("date") || lowerInput.includes("tarikh") || lowerInput.includes("somoy")) {
      toolName = "getTimeDate";
      toolArgs = {};
    } else if (lowerInput.includes("product") || lowerInput.includes("trimmer") || lowerInput.includes("mouse") || lowerInput.includes("dam")) {
      toolName = "getProductInfoHandler";
      toolArgs = {};
    } else if (lowerInput.includes("order")) {
      toolName = "getOrderDetails";
      toolArgs = { orderId: "1234" };
    }

    if (toolName) {
      const toolCallId = `call_${Date.now()}`;
      // ১. মডেল প্রথমে tool_calls ডিসাইড করেছে
      addNewContext(roomId, [
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: toolCallId,
              type: "function",
              function: {
                name: toolName,
                arguments: JSON.stringify(toolArgs),
              },
            },
          ],
        },
      ]);

      // ২. টুল এক্সিকিউট করা
      const toolResult = await dispatchToolCall({
        functionName: toolName,
        arguments: JSON.stringify(toolArgs),
      });

      const content =
        typeof toolResult === "string"
          ? toolResult
          : JSON.stringify(toolResult ?? "null");

      // ৩. টুলের রেজাল্ট কনটেক্সটে সেভ করা
      addNewContext(roomId, [
        {
          role: "tool",
          tool_call_id: toolCallId,
          content,
        },
      ]);

      // ৪. ফাইনাল রেসপন্স প্রস্তুত করা (টুল রেজাল্ট ব্যবহার করে)
      let finalAnswer = "";
      if (toolName === "getTimeDate") {
        finalAnswer = `${toolResult}`;
      } else if (toolName === "getProductInfoHandler") {
        const prods = Array.isArray(toolResult) ? toolResult : [];
        finalAnswer = `Amader stock-e nicher product-gulo ache:\n` +
          prods.map((p: any) => `• ${p.name} - ${p.sellingPrice || p.price} BDT`).join("\n");
      } else if (toolName === "getOrderDetails") {
        const order = toolResult as any;
        finalAnswer = `Order ID ${order.orderId}: Status '${order.status}', Estimated Delivery: ${order.estimatedDelivery}.`;
      }

      addNewContext(roomId, [{ role: "assistant", content: finalAnswer }]);
      return finalAnswer;
    }

    // জেনারেল মেসেজ
    const fallbackText = `Hello ${userName}! (Dummy AI Mode) I received: "${userInput}". How can I help you today?`;
    addNewContext(roomId, [{ role: "assistant", content: fallbackText }]);
    return fallbackText;
  }

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
