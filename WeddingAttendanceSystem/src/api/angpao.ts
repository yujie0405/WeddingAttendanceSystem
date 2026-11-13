import type { AngpaoRecord } from "../types";
import { weddingStore } from "./client";
export const angpaoApi = {
  getAll: async (): Promise<AngpaoRecord[]> =>
    weddingStore.getSnapshot().angpaoRecords,
  saveAll: async (records: AngpaoRecord[]): Promise<void> => {
    await weddingStore.transact((s) => {
      s.angpaoRecords = records;
    });
  },
};
