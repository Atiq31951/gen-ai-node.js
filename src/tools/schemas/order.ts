import { ToolSlice } from "../index";
import { getOrderDetailsHandler } from "../handlers/order";

export const orderTools: ToolSlice[] = [
  {
    definition: {
      type: "function",
      function: {
        name: "getOrderDetails",
        description: "Get order details",
        parameters: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "The order ID to get details for",
            },
            userId: {
              type: "string",
              description: "The user ID to get details for",
            },
            status: {
              type: "string",
              description: "The status to get details for",
            },
          },
          required: [],
        },
      },
    },
    handler: getOrderDetailsHandler,
  },
];
