import { useState, useEffect } from 'react';
import type { Guest } from '../types';
import { guestApi } from '../api';

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    guestApi.getAll().then(setGuests);
  }, []);

  const updateGuests = (newGuests: Guest[]) => {
    setGuests(newGuests);
    guestApi.saveAll(newGuests);
  };

  const toggleCheckIn = (guestId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const next = guests.map(g => g.id === guestId ? {
      ...g,
      status: g.status === 'arrived' ? ('pending' as const) : ('arrived' as const),
      checkInTime: g.status === 'arrived' ? undefined : now
    } : g);
    updateGuests(next);
  };

  const checkInFamily = (groupId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const next = guests.map(g => g.groupId === groupId && g.status === 'pending' ? {
      ...g, status: 'arrived' as const, checkInTime: now
    } : g);
    updateGuests(next);
  };

  return { guests, updateGuests, toggleCheckIn, checkInFamily };
}