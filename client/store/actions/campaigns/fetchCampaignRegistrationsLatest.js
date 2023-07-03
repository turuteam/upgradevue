/**
 * FETCH_CAMPAIGN_REGISTRATIONS
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } campaignOid
 */

export async function FETCH_CAMPAIGN_REGISTRATIONS_LATEST({ commit, state }, campaignOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if(isNaN(campaignOid)) {
    console.error('FETCH_CAMPAIGN_REGISTRATIONS_LATEST called with NaN campaignOid');
    return;
  }

  const audienceFilter = JSON.stringify({"conditions":[{"name":"campaigns","type":"condition-search-picker","data":{"condition":"true_to_all","values":[campaignOid]}}],"logic":[]})

  try {
    const { data } = await this.$axios.get(
      `/promoter/${promoterOid}/filter-fan/`, {
        params: {
          $count: true,
          $top: 5,
          $orderby: 'registrationTime desc',
          $audienceFilter: audienceFilter,
        },
      },
    );

    return data;
  } catch (error) {
    throw error;
  }
}
