import { ToolSlice } from "../index";
import { getDateHandler } from "../handlers/date";

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
            currentDate: {
              type: "string",
              description: "The current date",
            },
            fromDate: {
              type: "string",
              description: "The current date",
            },
            agoDay: {
              type: "number",
              description: "The number of days before today or particular date",
            },
            nextDay: {
              type: "number",
              description: "The number of days after today or particular date",
            },
          },
          required: [],
        },
      },
    },
    handler: getDateHandler,
  },
];
