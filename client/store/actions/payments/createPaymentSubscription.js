/**
 * CREATE_PAYMENT_SUBSCRIPTION
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function CREATE_PAYMENT_SUBSCRIPTION({ state, dispatch }, {
  planOid,
  planQuantity,
  paymentSourceOid,
  additionalInfo,
  planUnitPrice,
}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;
  try {
    const payload = {
      planOid,
      paymentSourceOid,
    };
    if (typeof planQuantity === 'number') {
      payload.planQuantity = planQuantity;
    }
    if (additionalInfo) {
      payload.additionalInfo = additionalInfo;
    }
    if (typeof planUnitPrice === 'number') {
      payload.planUnitPrice = planUnitPrice;
    }
    await this.$axios.post(`/promoter/${promoterOid}/provider-payment-subscription`, payload);

    dispatch('auth/VERIFY_TOKEN');
    return true;
  } catch (error) {
    throw error;
  }
}
