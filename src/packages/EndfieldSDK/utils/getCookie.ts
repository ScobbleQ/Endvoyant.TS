export function getCookie(cookies: string[] | string | undefined) {
  for (const cookie of typeof cookies === "string" ? [cookies] : (cookies ?? [])) {
    if (!cookie.startsWith("ACCOUNT_TOKEN=")) continue;
    const rest = cookie.slice("ACCOUNT_TOKEN=".length);
    return rest.split(";")[0];
  }
  return null;
}
