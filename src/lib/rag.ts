import { openai, RAGChat } from "@upstash/rag-chat";
import { redisDB } from "./redis";

const ragChat = new RAGChat({
  model: openai("gpt-4-turbo"), // upstash("meta-llama/Meta-Llama-3-8B-Instruct"),
  redis: redisDB,
});

async function RemoveContext(namespace: string, src: string) {
  await ragChat.context.delete({ id: "1", namespace: namespace });
  return true;
}

async function GetChatHistory(chatId: string) {
  const MsgsHistory = await ragChat.history.getMessages({
    sessionId: chatId,
    amount: 100,
  });
  return MsgsHistory;
}

export { ragChat, GetChatHistory };
