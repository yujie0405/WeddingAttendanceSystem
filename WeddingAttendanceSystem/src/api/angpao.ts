import { storage } from './client';
import { INITIAL_ANGPAO } from '../data';
import type { AngpaoRecord } from '../types';

const KEY = 'wedding_angpao';

export const angpaoApi = {
  getAll: async (): Promise<AngpaoRecord[]> => storage.get(KEY, INITIAL_ANGPAO),
  saveAll: async (records: AngpaoRecord[]): Promise<void> => storage.set(KEY, records),
};