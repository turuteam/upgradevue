/**
 * FETCH_EVENT_CAMPAIGNS
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.eventOid
 */

export async function FETCH_EVENT_CAMPAIGNS({ state }, eventOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    const { data } = await this.$axios.get(
      `/promoter/${promoterOid}/campaign?$select=name,endDate,event,resources,type,urlSlug,summaryStatsSnapshot,presentation,settings&$filter=eventOid=${eventOid} AND type != rsvp`
    );
    const campaigns = data.reduce((obj, campaign) => {
      Object.assign(obj, {
        [campaign.oid]: campaign,
      });
      return obj;
    }, {});

    return campaigns;
  } catch (error) {
    console.error(error);
    return {};
  }
}
