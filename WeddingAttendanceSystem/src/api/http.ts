import { apiBaseUrl } from "../config";
import { AppError } from "../i18n/messages";
import { supabase } from "./supabase";

let refresh: ReturnType<NonNullable<typeof supabase>["auth"]["refreshSession"]> | undefined;

export async function apiRequest<T>(path: string, options: RequestInit = {}, explicitToken?: string): Promise<T> {
  if (!supabase) throw new AppError("Backend.ConfigurationRequired");
  const session = explicitToken ? null : await supabase.auth.getSession();
  let token = explicitToken || session?.data.session?.access_token;
  if (!token) throw new AppError("Backend.SessionExpired");
  const send = () => fetch(apiBaseUrl + path, {
    ...options,
    headers: { ...options.headers, "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  let response: Response;
  try {
    response = await send();
    if (response.status === 401 && !explicitToken) {
      // Coalesce concurrent refreshes; the SDK owns token storage and rotation.
      refresh ??= supabase.auth.refreshSession();
      const result = await refresh.finally(() => { refresh = undefined; });
      token = result.data.session?.access_token;
      if (!result.error && token) response = await send();
    }
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new AppError("Backend.NetworkError");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) throw new AppError("Backend.SessionExpired");
    if (response.status === 403) throw new AppError("Backend.Forbidden");
    if (body.code === "TAG_IN_USE") throw new AppError("Backend.TagInUse");
    if (response.status === 409) throw new AppError("Backend.Conflict");
    if (response.status === 400) throw new AppError("Backend.InvalidInput");
    throw new AppError("Backend.RequestFailed");
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}
