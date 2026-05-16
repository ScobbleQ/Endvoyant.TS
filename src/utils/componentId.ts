const SEPARATOR = "|";

export function createComponentId(commandName: string, interactionName: string, ...args: string[]) {
  return [commandName, interactionName, ...args].map((p) => encodeURIComponent(p)).join(SEPARATOR);
}

export function parseComponentId(customId: string) {
  const parts = customId.split(SEPARATOR);
  if (parts.length < 2) return null;

  try {
    const [commandName, interactionName, ...args] = parts.map((p) => decodeURIComponent(p));
    if (!commandName || !interactionName) return null;
    return { commandName, interactionName, args };
  } catch {
    return null;
  }
}
