/**
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.integrationOid
 */
export async function CREATE_CUSTOM_AUDIENCE({ state }, { filterGroupOid, adAccountId, integrationOid }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  const data = {
    promoterOid,
    filterGroupOid,
    adAccount: adAccountId,
  };

  try {
    // Call API with 'sg' endpoint
    await this.$axios.sg.post(`/promoter/${promoterOid}/integration/${integrationOid}/custom-audience`, data);
    return;
  } catch (e) {
    throw e;
  }
}


/**
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.integrationOid
 */
export async function DELETE_CUSTOM_AUDIENCE({ state }, { customAudienceId, integrationOid }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    // Call API with 'sg' endpoint
    await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${integrationOid}/custom-audience/${customAudienceId}`);
  } catch (e) {
    throw e;
  }
}
