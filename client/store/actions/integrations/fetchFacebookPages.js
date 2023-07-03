/**
 * FETCH_FACEBOOK_PAGES
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 */
export async function FETCH_FACEBOOK_PAGES({ state }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    const params = {
      $filter: 'app=messenger AND (authorized OR paymentSubscriptionOid IS NOT NULL)',
      $top: 'all',
    };
    const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration-subscription`, {
      params,
    });

    return data;
  } catch (error) {
    throw error;
  }
}
