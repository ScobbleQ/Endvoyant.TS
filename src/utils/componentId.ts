const SEPARATOR = "|";

export function createComponentId(commandName: string, interactionName: string, ...args: string[]) {
  return [commandName, interactionName, ...args].join(SEPARATOR);
}

export function parseComponentId(customId: string) {
  const parts = customId.split(SEPARATOR);
  if (parts.length < 2) return null;

  try {
    const [commandName, interactionName, ...args] = parts;
    if (!commandName || !interactionName) return null;
    return { commandName, interactionName, args };
  } catch {
    return null;
  }
}
