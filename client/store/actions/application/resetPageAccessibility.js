/**
 * RESET_PAGE_ACCESSIBILITY
 *
 * @param { object } context - Store context (commit)
 * @param { object } layout
 * @returns { boolean }
 */
export function RESET_PAGE_ACCESSIBILITY({ commit }) {
  commit('SET_PAGE_ACCESSIBILITY', { accessible: true, noAccessibilityTo: null });
}
      