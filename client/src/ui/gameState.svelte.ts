export const gameState = $state({
  zoom: 1,
  messages: [] as { id: number; text: string }[],
  selectedUnitId: null as string | null,
});

let _msgId = 0;

export function pushMessage(text: string, ttl = 4000) {
  const id = _msgId++;
  gameState.messages.push({ id, text });
  setTimeout(() => {
    const idx = gameState.messages.findIndex((m) => m.id === id);
    if (idx !== -1) gameState.messages.splice(idx, 1);
  }, ttl);
}
