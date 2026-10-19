import { computed, onUnmounted, ref, watch, type Ref } from "vue";

/** Where the browser remembers that I've seen the drag tip. Storage can be unavailable (a private window, say), so every read and write is wrapped; then the tip just shows again next visit. */
const dragTipKey = "lemma.dragTipSeen";

function readDragTipSeen() {
  try {
    return localStorage.getItem(dragTipKey) === "true";
  } catch {
    return false;
  }
}

/**
 * The tip about drag-selecting shows once, ever. `dragTipSeen` is whether it has already shown (or I found
 * drag-selecting by myself); `dragTipShowing` is whether it's in the bar right now. Both are shared by the
 * points and topics views, so the tip shows once in total.
 */
const dragTipSeen = ref(readDragTipSeen());
const dragTipShowing = ref(false);

function markDragTipSeen() {
  dragTipSeen.value = true;
  try {
    localStorage.setItem(dragTipKey, "true");
  } catch {
    // Storage is unavailable; the tip won't show again until the page reloads.
  }
}

/** Shows the tip if it has never shown, and marks it seen straight away, so this is the only time. */
function showDragTip() {
  if (dragTipSeen.value) return;
  dragTipShowing.value = true;
  markDragTipSeen();
}

function hideDragTip() {
  dragTipShowing.value = false;
}

/**
 * The drag tip for a view's pinned bar: `showDragTip` when I select something by clicking, `hideDragTip` for its
 * dismiss button. Its one showing also ends when the selection empties (the bar goes away) or the view closes.
 */
export function useDragTip(selectedCount: () => number) {
  watch(() => selectedCount() === 0, (nothingSelected) => {
    if (nothingSelected) hideDragTip();
  });
  onUnmounted(hideDragTip);
  return { dragTipShowing, showDragTip, hideDragTip };
}

/**
 * Drag-to-select, the way a desktop works: pressing the main mouse button inside `area` and dragging draws a
 * rectangle; every card it touches is previewed in `touched` while I drag, and passed to `add` when I let go.
 * I can scroll while dragging, with the wheel or by holding the pointer near the top or bottom of the window,
 * and the rectangle stays anchored to where I pressed on the page.
 *
 * Each selectable card's element carries `data-key` with its key; anything without it (such as the Unsorted
 * card) is never selected. Presses on buttons, inputs, menus, dialogs and the pinned bar are left alone, so those
 * controls work as usual. A press that moves less than `dragDistance` pixels is a click, left to the card.
 */
export function useBoxSelect<Key extends string>(area: Ref<HTMLElement | null>, add: (keys: Set<Key>) => void) {
  /** The rectangle in window coordinates: `x` and `y` where I pressed, `toX` and `toY` where the pointer is now. */
  const box = ref<{ x: number; y: number; toX: number; toY: number } | null>(null);

  /** The cards the rectangle touches right now. */
  const touched = ref(new Set<Key>()) as Ref<Set<Key>>;

  /** Where I pressed, in page coordinates, so it stays put when the page scrolls. Null when I'm not pressing. */
  let pressedAt: { x: number; y: number } | null = null;
  /** Where the pointer is now, in window coordinates. */
  let pointer = { x: 0, y: 0 };
  let dragged = false;

  /** How far, in pixels, the pointer must move while pressed before a press counts as a drag rather than a click. */
  const dragDistance = 5;
  /** How close, in pixels, the pointer must be to the top or bottom of the window to scroll it, and the fastest it scrolls, in pixels per frame. */
  const scrollEdge = 48;
  const maxScrollSpeed = 20;
  let scrollFrame = 0;

  /** The rectangle as CSS, whichever way I dragged. */
  const boxStyle = computed(() => {
    if (!box.value) return {};
    const { x, y, toX, toY } = box.value;
    return {
      left: `${Math.min(x, toX)}px`,
      top: `${Math.min(y, toY)}px`,
      width: `${Math.abs(toX - x)}px`,
      height: `${Math.abs(toY - y)}px`,
    };
  });

  function press(event: PointerEvent) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button, input, .menu, dialog, .bulk")) return;
    event.preventDefault(); // stops the drag from highlighting text
    pressedAt = { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY };
    pointer = { x: event.clientX, y: event.clientY };
    window.addEventListener("pointermove", grow);
    window.addEventListener("pointerup", end);
    window.addEventListener("scroll", update);
  }

  /** Finds every card that overlaps the rectangle, by comparing each card's position on screen with it. */
  function cardsUnderBox() {
    const found = new Set<Key>();
    if (!box.value) return found;
    const { x, y, toX, toY } = box.value;
    const left = Math.min(x, toX), right = Math.max(x, toX), top = Math.min(y, toY), bottom = Math.max(y, toY);
    for (const card of area.value?.querySelectorAll<HTMLElement>("[data-key]") ?? []) {
      const r = card.getBoundingClientRect();
      if (r.left <= right && r.right >= left && r.top <= bottom && r.bottom >= top) found.add(card.dataset.key as Key);
    }
    return found;
  }

  /**
   * Redraws the rectangle from where I pressed to where the pointer is, and updates which cards it touches. It
   * runs when the pointer moves and when the page scrolls, since either changes the rectangle. Nothing is drawn
   * until the pointer has moved far enough from where I pressed.
   */
  function update() {
    if (!pressedAt) return;
    const from = { x: pressedAt.x - window.scrollX, y: pressedAt.y - window.scrollY };
    if (!box.value && Math.hypot(pointer.x - from.x, pointer.y - from.y) < dragDistance) return;
    if (!box.value) {
      window.getSelection()?.removeAllRanges();
      scrollFrame = requestAnimationFrame(scrollNearEdge);
    }
    box.value = { x: from.x, y: from.y, toX: pointer.x, toY: pointer.y };
    touched.value = cardsUnderBox();
  }

  function grow(event: PointerEvent) {
    pointer = { x: event.clientX, y: event.clientY };
    update();
  }

  /** While I drag, scrolls the page when the pointer is near the top or bottom of the window: faster the closer it is. Scrolling calls `update`. */
  function scrollNearEdge() {
    const fromTop = pointer.y, fromBottom = window.innerHeight - pointer.y;
    if (fromTop < scrollEdge) window.scrollBy(0, -maxScrollSpeed * (1 - fromTop / scrollEdge));
    else if (fromBottom < scrollEdge) window.scrollBy(0, maxScrollSpeed * (1 - fromBottom / scrollEdge));
    scrollFrame = requestAnimationFrame(scrollNearEdge);
  }

  /** Hands the touched cards to `add`, then removes the rectangle. */
  function end() {
    window.removeEventListener("pointermove", grow);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("scroll", update);
    cancelAnimationFrame(scrollFrame);
    pressedAt = null;
    if (!box.value) return;
    dragged = true;
    setTimeout(() => (dragged = false));
    // I've found drag-selecting, so the tip about it has done its job.
    markDragTipSeen();
    hideDragTip();
    add(touched.value);
    touched.value = new Set();
    box.value = null;
  }
  onUnmounted(end);

  /** True just after a drag. A drag that ends on the card it started on also fires a click there; that click isn't a toggle. */
  const justDragged = () => dragged;

  return { box, boxStyle, touched, press, justDragged };
}
