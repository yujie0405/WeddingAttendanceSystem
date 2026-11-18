const tokenKey = "wedding-api-session";
export function getAccessToken() { return sessionStorage.getItem(tokenKey); }
export function setAccessToken(token: string | null) {
  if (token) sessionStorage.setItem(tokenKey, token);
  else sessionStorage.removeItem(tokenKey);
}
