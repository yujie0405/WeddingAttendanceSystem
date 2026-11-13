import type { TableConfig } from "../types";
import { weddingStore } from "./client";
export const tableApi = {
  getAll: async () => weddingStore.getSnapshot().tables,
  saveAll: async (tables: TableConfig[]) => {
    await weddingStore.transact((s) => {
      s.tables = tables;
    });
  },
};
