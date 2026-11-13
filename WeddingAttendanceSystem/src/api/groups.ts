import type { Group } from "../types";
import { weddingStore } from "./client";
export const groupApi = {
  getAll: async () => weddingStore.getSnapshot().groups,
  saveAll: async (groups: Group[]) => {
    await weddingStore.transact((s) => {
      s.groups = groups;
    });
  },
};
