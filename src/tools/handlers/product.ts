const products = [
  {
    productId: "1",
    name: "Phillips Trimmer for man",
    price: 1700,
    description: "Product description",
    buyingPrice: 1500,
    sellingPrice: 1700,
    type: "electronic",
    subType: "personal care",
    url: "https://example.com/product/1fnan452nann",
  },
  {
    productId: "2",
    name: "Razer DeathAdder V3",
    price: 200,
    description: "Product description",
    buyingPrice: 100,
    sellingPrice: 200,
    type: "electronic",
    subType: "gaming",
    url: "https://example.com/product/2fnan452nann",
  },
];

export const getProductInfoHandler = async (args: any) => {
  const {
    productId,
    name,
    price,
    description,
    buyingPrice,
    sellingPrice,
    type,
    subType,
    url,
  } = args as {
    productId: string;
    name: string;
    price: number;
    description: string;
    buyingPrice: number;
    sellingPrice: number;
    type: string;
    subType: string;
    url: string;
  };
  // TODO: Implement product info retrieval

  return products;
};
