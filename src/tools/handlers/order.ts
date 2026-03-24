export const getOrderDetailsHandler = async (args: Record<string, unknown>) => {
  const { orderId } = args as { orderId: string };
  // TODO: Implement order details retrieval
  return {
    orderId,
    status: "on the way",
    estimatedDelivery: "2025-10-20",
  };
};
