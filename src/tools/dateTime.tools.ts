import { ToolSlice } from "./index";
import { addNewContext } from "../utils/contextManager";

export const dateTimeTools: ToolSlice[] = [
  {
    definition: {
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
    handler: async (args: {
      timezone?: string;
      agoDay?: number;
      tool_call_id?: string;
    }) => {
      const date = new Date();
      if (args.agoDay) {
        date.setDate(date.getDate() - args.agoDay);
      }

      // addNewContext([
      //   {
      //     role: "tool",
      //     tool_call_id: "getTimeDate",
      //     content: `Today is ${date.toLocaleDateString("en-US", { timeZone: args.timezone ?? "UTC" })}`,
      //   },
      // ]);

      console.log("DateTime tool called with args:", args);
      // addNewContext([
      //   {
      //     role: "tool",
      //     tool_call_id,
      //     content: `Today is ${date.toLocaleDateString("en-US", { timeZone: args.timezone ?? "UTC" })}`,
      //   },
      // ]);
      return `Today is ${date.toLocaleDateString("en-US", { timeZone: args.timezone ?? "UTC" })}`;
    },
  },
];
