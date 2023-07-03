/**
 * UPDATE_PAYMENT
 * Fetch the existing promoter's integration
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function UPDATE_PAYMENT({}, { promoterOid, demoPromoterPlan }) {
  try {
    await this.$axios.post(`/promoter/${promoterOid}/plan`, demoPromoterPlan);
  } catch (error) {
    throw error;
  }
}
