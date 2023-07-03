/**
 * UPDATE_PAYMENT_SUBSCRIPTION
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 */
export async function UPDATE_PAYMENT_SUBSCRIPTION({ state, dispatch }, { planOid, planQuantity, paymentSourceOid, subscriptionOid }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;
  if(!subscriptionOid) return;
  try {
    const payload = {};
    if (planOid !== null || planOid !== undefined) {
      payload.planOid = planOid;
    }
    if (planQuantity !== null || planQuantity !== undefined) {
      payload.planQuantity = planQuantity;
    }
    if (paymentSourceOid !== null || paymentSourceOid !== undefined) {
      payload.paymentSourceOid = paymentSourceOid;
    }
    const ans = await this.$axios.patch(`/promoter/${promoterOid}/provider-payment-subscription/${subscriptionOid}`, payload);

    if(ans.status === 204) return true;
    return false;

  } catch (error) {
    throw error;
  }
}
