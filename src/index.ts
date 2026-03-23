import { createChatCompletion } from "./services/chat.service";

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();
  if (userInput === "exit") {
    process.exit(0);
  }

  await createChatCompletion(userInput);
});
