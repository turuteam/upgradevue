/**
 * FETCH_SHARE_ANALYTICS_LINK
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } campaignOid
 */

export async function FETCH_SHARE_ANALYTICS_LINK({ state }, campaignOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if(isNaN(campaignOid)) {
    console.error('FETCH_SHARE_ANALYTICS_LINK called with NaN campaignOid');
    return;
  }

  try {
    const { data } = await this.$axios.get(
      `/promoter/${promoterOid}/share-analytics/${campaignOid}`
    );
    return data;
  } catch (error) {
    // TODO: Notify client
    throw error;
  }
}
