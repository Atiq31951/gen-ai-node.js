import { ToolSlice } from "./index";

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
          },
          required: [],
        },
      },
    },
    handler: async (args: Record<string, unknown>) => {
      const { orderId } = args as { orderId: string };
      // TODO: Implement order details retrieval
      return {
        orderId,
        status: "on the way",
        estimatedDelivery: "2025-10-20",
      };
    },
  },
];
