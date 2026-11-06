import { storage } from './client';
import { INITIAL_GUESTS } from '../data';
import type { Guest } from '../types';

const KEY = 'wedding_guests';

export const guestApi = {
  getAll: async (): Promise<Guest[]> => storage.get(KEY, INITIAL_GUESTS),
  saveAll: async (guests: Guest[]): Promise<void> => storage.set(KEY, guests),
};