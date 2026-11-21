import { apiBaseUrl } from "../config";
import { AppError } from "../i18n/messages";
import { getAccessToken } from "./session";

export async function apiRequest<T>(path: string, options: RequestInit = {}, explicitToken?: string): Promise<T> {
  const token = explicitToken || getAccessToken();
  if (!token) throw new AppError("Backend.SessionExpired");
  const send = () => fetch(apiBaseUrl + path, {
    ...options,
    headers: { ...options.headers, "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  let response: Response;
  try {
    response = await send();
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new AppError("Backend.NetworkError");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) throw new AppError("Backend.SessionExpired");
    if (response.status === 403) throw new AppError("Backend.Forbidden");
    if (body.code === "TAG_IN_USE") throw new AppError("Backend.TagInUse");
    if (body.code === "STATUS_NOT_CONFIGURED") throw new AppError("Backend.AttendanceStatusNotConfigured");
    if (body.code === "TABLE_IN_USE") throw new AppError("Backend.TableInUse");
    if (body.code === "TABLE_NUMBER_EXISTS") throw new AppError("Backend.TableNumberExists");
    if (body.code === "TABLE_CAPACITY_EXCEEDED") throw new AppError("Backend.TableCapacityExceeded");
    if (response.status === 409) throw new AppError("Backend.Conflict");
    if (response.status === 400) throw new AppError("Backend.InvalidInput");
    throw new AppError("Backend.RequestFailed");
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}
