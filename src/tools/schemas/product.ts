import { ToolSlice } from "../index";
import { getProductInfoHandler } from "../handlers/product";

export const productTools: ToolSlice[] = [
  {
    definition: {
      type: "function",
      function: {
        name: "getProductInfoHandler",
        description: "Get product details",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name or handle of the product",
            },
            productId: {
              type: "string",
              description: "The ID of the product",
            },
            price: {
              type: "number",
              description: "The price of the product",
            },
            description: {
              type: "string",
              description: "The description of the product",
            },
            buyingPrice: {
              type: "number",
              description: "The buying price of the product",
            },
            sellingPrice: {
              type: "number",
              description: "The selling price of the product",
            },
          },
          required: [],
        },
      },
    },
    handler: getProductInfoHandler,
  },
];
