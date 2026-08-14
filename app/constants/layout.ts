/** Floating pill tab bar (Android + iOS < 26). */
export const FLOATING_TAB_BAR_HEIGHT = 48;
/** Equal gap from pill edge to first/last icon circle. */
export const TAB_BAR_END_PAD = 3;
/** Gap between icon circles inside the pill. */
export const TAB_BAR_ITEM_GAP = 6;

export function floatingTabBarWidth(tabCount: number): number {
  if (tabCount <= 0) return 0;
  return (
    TAB_BAR_END_PAD * 2 +
    tabCount * TAB_BAR_INDICATOR_SIZE +
    Math.max(0, tabCount - 1) * TAB_BAR_ITEM_GAP
  );
}
/** Vertical margin inside the pill for the active circle. */
export const TAB_BAR_INDICATOR_INSET = 3;
export const TAB_BAR_ICON_SIZE = 20;

/** Gap above the native system bottom inset. */
export const TAB_BAR_BOTTOM_OFFSET = 12;

export const TAB_BAR_INDICATOR_SIZE =
  FLOATING_TAB_BAR_HEIGHT - TAB_BAR_INDICATOR_INSET * 2;

/** Tab bar container height — uses native safe-area inset only. */
export function floatingTabBarContainerHeight(nativeBottomInset: number): number {
  return FLOATING_TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + nativeBottomInset;
}
