/**
 * CHECK_PAGE_ACCESSIBILITY
 *
 * @param { object } context - Store context (commit)
 * @param { object } layout
 * @returns { boolean }
 */
export function CHECK_PAGE_ACCESSIBILITY({ commit, rootGetters }, { featureKeys, featureName }) {
  const pageEnabled = rootGetters['auth/isFeatureEnabled'](featureKeys);

  if (!pageEnabled) {
    commit('SET_PAGE_ACCESSIBILITY', { accessible: false, noAccessibilityTo: featureName });
  }
}
    