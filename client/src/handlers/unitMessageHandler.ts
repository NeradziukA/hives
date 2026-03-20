import { pushMessage } from "../ui/gameState.svelte.ts";

type UnitMessageMsg = {
  srcId: string;
  payload?: { text?: string; username?: string };
};

export function handleUnitMessage(message: UnitMessageMsg): void {
  const text = message.payload?.text;
  if (!text) return;
  const from = message.payload?.username ?? message.srcId.slice(0, 8);
  pushMessage(`[${from}]: ${text}`, 8000);
}
