import { Index } from "@upstash/vector";
import { RAGChat } from "@upstash/rag-chat";
import { Redis } from "@upstash/redis";
import { openai } from "@upstash/rag-chat";

export class RagChatService {
  private ragChat: RAGChat;
  private index: Index;
  private redis: Redis;
  private currentVideoId: string | null = null;

  constructor() {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    this.ragChat = new RAGChat({
      model: openai("gpt-3.5-turbo", {
        apiKey: process.env.OPENAI_API_KEY!,
      }),
      vector: this.index,
      redis: this.redis,
    });
  }

  async clearPreviousData() {
    if (this.currentVideoId) {
      const items = await this.index.fetch({ limit: 1000 });
      const itemsToDelete = items.filter((item) =>
        item.id.startsWith(this.currentVideoId!),
      );
      if (itemsToDelete.length > 0) {
        await this.index.delete(itemsToDelete.map((item) => item.id));
      }
      await this.redis.del(this.currentVideoId);
    }
    this.currentVideoId = null;
  }

  async addContext(videoId: string, videoInfo: any, transcript: any[]) {
    await this.clearPreviousData();
    this.currentVideoId = videoId;

    const content = `
      Title: ${videoInfo.title}
      Description: ${videoInfo.description}
      Transcript: ${transcript.map((t) => t.text).join(" ")}
    `;

    await this.ragChat.context.add({
      type: "text",
      data: content,
      id: videoId,
    });
  }

  async chat(message: string) {
    if (!this.currentVideoId) {
      throw new Error("No video context has been set");
    }

    const response = await this.ragChat.chat(message, {
      filter: { id: this.currentVideoId },
    });

    return response;
  }
}
