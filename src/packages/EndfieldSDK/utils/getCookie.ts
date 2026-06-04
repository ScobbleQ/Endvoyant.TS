export function getCookie(cookies: string[]) {
  for (const cookie of cookies) {
    if (!cookie.startsWith("ACCOUNT_TOKEN=")) continue;
    const rest = cookie.slice("ACCOUNT_TOKEN=".length);
    return rest.split(";")[0];
  }
  return null;
}
