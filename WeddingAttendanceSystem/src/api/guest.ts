import type { Guest } from "../types";
import { weddingStore } from "./client";
export const guestApi = {
  getAll: async (): Promise<Guest[]> => weddingStore.getSnapshot().guests,
  saveAll: async (guests: Guest[]): Promise<void> => {
    await weddingStore.transact((s) => {
      s.guests = guests;
    });
  },
};
