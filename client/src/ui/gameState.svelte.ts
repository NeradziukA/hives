export type UnitCandidate = {
  unitId: string;
  username: string | null;
  objectType: string | null;
};

export const gameState = $state({
  zoom: 1,
  messages: [] as { id: number; text: string }[],
  messageHistory: [] as { id: number; text: string }[],
  selectedUnitId: null as string | null,
  selectedObjectType: null as string | null,
  selectedUnitUsername: null as string | null,
  faction: null as string | null,
  messagingMode: false,
  unitPickerCandidates: [] as UnitCandidate[],
  visionRadius: 200, // meters; base = 200 + vision_attribute * 10
});

// Wired up by game.ts after camera setup; call to actually move the camera
export let setZoom: (value: number) => void = () => {};
export function wireSetZoom(fn: (value: number) => void) {
  setZoom = fn;
}

let _msgId = 0;

const MESSAGE_HISTORY_MAX = 500;

export function pushMessage(text: string, ttl = 4000) {
  const id = _msgId++;
  gameState.messages.push({ id, text });
  gameState.messageHistory.push({ id, text });
  if (gameState.messageHistory.length > MESSAGE_HISTORY_MAX) {
    gameState.messageHistory.shift();
  }
  setTimeout(() => {
    const idx = gameState.messages.findIndex((m) => m.id === id);
    if (idx !== -1) gameState.messages.splice(idx, 1);
  }, ttl);
}
