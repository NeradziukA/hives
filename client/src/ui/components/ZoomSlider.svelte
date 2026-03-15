<script lang="ts">
  import { gameState, setZoom } from "../gameState.svelte.ts";

  const ZOOM_MIN = 0.05;
  const ZOOM_MAX = 200;
  const LOG_MIN = Math.log(ZOOM_MIN);
  const LOG_MAX = Math.log(ZOOM_MAX);

  function zoomToSlider(zoom: number) {
    return 1 - (Math.log(zoom) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  }

  function sliderToZoom(raw: number) {
    return Math.exp(LOG_MIN + (1 - raw) * (LOG_MAX - LOG_MIN));
  }

  let isDragging = $state(false);
  let localSlider = $state(zoomToSlider(gameState.zoom));

  // Sync from external zoom changes (wheel) only when not dragging
  $effect(() => {
    if (!isDragging) {
      localSlider = zoomToSlider(gameState.zoom);
    }
  });

  function onInput(e: Event) {
    const raw = parseFloat((e.target as HTMLInputElement).value);
    localSlider = raw;
    setZoom(sliderToZoom(raw));
  }
</script>

<div class="zoom-slider">
  <span class="label">+</span>
  <input
    type="range"
    min="0"
    max="1"
    step="0.001"
    value={localSlider}
    oninput={onInput}
    onpointerdown={() => (isDragging = true)}
    onpointerup={() => (isDragging = false)}
  />
  <span class="label">−</span>
  <span class="zoom-value">{gameState.zoom.toFixed(1)}×</span>
</div>

<style>
  .zoom-slider {
    position: fixed;
    left: 16px;
    width: 38px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 5;
    pointer-events: auto;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
  }

  .label {
    font-size: 18px;
    line-height: 1;
    user-select: none;
  }

  .zoom-value {
    white-space: nowrap;
    opacity: 0.8;
  }

  input[type="range"] {
    appearance: slider-vertical;
    writing-mode: vertical-lr;
    direction: rtl;
    width: 6px;
    height: 160px;
    cursor: pointer;
    accent-color: var(--accent);
    background: transparent;
  }

  @-moz-document url-prefix() {
    input[type="range"] {
      appearance: none;
      writing-mode: vertical-lr;
    }
  }
</style>
