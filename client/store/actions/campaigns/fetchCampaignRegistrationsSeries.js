/**
 * FETCH_CAMPAIGN_REGISTRATIONS_SERIES
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } campaignOid
 */

export async function FETCH_CAMPAIGN_REGISTRATIONS_SERIES({ commit, state }, campaignOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if(isNaN(campaignOid)) {
    console.error('FETCH_CAMPAIGN_REGISTRATIONS_SERIES called with NaN campaignOid');
    return;
  }

  try {
    const { data } = await this.$axios.get(
      `/promoter/${promoterOid}/campaign/${campaignOid}/registration-stats-time-series-2/${campaignOid}`
    );

    return data;
  } catch (error) {
    throw error;
  }
}
