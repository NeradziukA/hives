import { pushMessage } from "../ui/gameState.svelte.ts";

type UnitMessageMsg = {
  srcId: string;
  payload?: { text?: string };
};

export function handleUnitMessage(message: UnitMessageMsg): void {
  const text = message.payload?.text;
  if (!text) return;
  const from = message.srcId.slice(0, 8);
  pushMessage(`[${from}]: ${text}`, 8000);
}
