import { apiRequest } from "./http";

export interface ApiGuest {
  id: number;
  guestName: string;
  relationId: number;
  relationship: string;
  weddingSide: number;
  guestNum: number;
  attendanceStatusId: number;
  attendanceStatus: string;
  tableNumber: number | null;
  createdDate: string;
}
export interface GuestInput {
  guestName: string;
  relationId: number;
  weddingSide: number;
  guestNum: number;
  attendanceStatusId: number;
  tableNumber: number | null;
}
export interface Lookup { id: number; name: string }
export interface GuestPage { items: ApiGuest[]; page: number; pageSize: number; totalCount: number }
export interface Money { guestId: number; amount: number }
export const backend = {
  guests: (query: URLSearchParams, signal?: AbortSignal) => apiRequest<GuestPage>(`/guests?${query}`, { signal }),
  tags: (signal?: AbortSignal) => apiRequest<Lookup[]>("/guest-tags", { signal }),
  statuses: (signal?: AbortSignal) => apiRequest<Lookup[]>("/attendance-statuses", { signal }),
  saveGuest: (guest: GuestInput, id?: number) => apiRequest<ApiGuest>(id ? `/guests/${id}` : "/guests", {
    method: id ? "PUT" : "POST", body: JSON.stringify(guest),
  }),
  attendance: (id: number, status: number) => apiRequest<ApiGuest>(`/guests/${id}/attendance`, {
    method: "PUT", body: JSON.stringify({ attendanceStatusId: status }),
  }),
  addTag: (tagName: string) => apiRequest<Lookup>("/guest-tags", { method: "POST", body: JSON.stringify({ tagName }) }),
  deleteTag: (id: number) => apiRequest<void>(`/guest-tags/${id}`, { method: "DELETE" }),
  money: (id: number, signal?: AbortSignal) => apiRequest<Money>(`/admin/guests/${id}/angpau`, { signal }),
  total: (signal?: AbortSignal) => apiRequest<{ amount: number; currency: string }>("/admin/summary/angpau", { signal }),
  setMoney: (id: number, amount: number) => apiRequest<Money>(`/admin/guests/${id}/angpau`, {
    method: "PUT", body: JSON.stringify({ amount }),
  }),
};
