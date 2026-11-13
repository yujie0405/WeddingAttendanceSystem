import type { Tag } from "../types";
import { weddingStore } from "./client";
export const tagApi = {
  getAll: async () => weddingStore.getSnapshot().tags,
  saveAll: async (tags: Tag[]) => {
    await weddingStore.transact((s) => {
      s.tags = tags;
    });
  },
};
