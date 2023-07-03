/**
 * CREATE_CAMPAIGN
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.eventOid - The eventOid (the campaign will be linked to )
 * @param { string } payload.type - The campaign type
 * @param { string } payload.name - The campaign name
 * @param { string } payload.urlSlug - The urlSlug
 * @param { date } payload.startDate - Date in ISOString format
 * @param { date } payload.endDate - Date in ISOString format
 * @param { date } payload.notifyDate - Date in ISOString format
 * @param { timeZone } payload.timeZone - Timezone string
 * @param { array } payload.fields - Registration fields
 * @param { object } payload.providers - Registration providers
 * @param { object } payload.presentation
 * @param { string } payload.presentation.description
 * @param { string } payload.presentation.headline
 * @param { string } payload.presentation.headHtml
 * @param { string } payload.presentation.bodyHtml
 * @param { string } payload.presentation.timeZone
 * @param { object } payload.presentation.color
 * @param { array } payload.resources - Resources of assets containing the bucketOids
 * @param { array } payload.connect
 * @param { array } payload.followAccounts
 * @param { array } payload.shareChannels
 * @param { array } payload.inviteChannels
 * @param { object } payload.advancedSettings - Advanced settings (Custom CTA, disable points system, disable email notifications)
 */


export async function CREATE_CAMPAIGN({ state, commit }, campaignDTO) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    campaignDTO.promoterOid = promoterOid;
    const { data } = await this.$axios.post(`/promoter/${promoterOid}/campaign`, campaignDTO);

    return data;
  } catch (error) {
    // TODO: Notify client
    console.log(error);
  }
}
