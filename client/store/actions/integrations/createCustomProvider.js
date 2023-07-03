/**
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.integrationOid
 * @emits SET_FACEBOOK_CUSTOM_AUDIENCES
 */
export async function CREATE_CUSTOM_PROVIDER(
  { state, dispatch, commit },
  { provider, mapping }) {

  if (!state.auth.account) { return null; }
  const { promoterOid, oid } = state.auth.account;
  // payload
  const payload = {
    promoterOid,
    promoterAccountOid: oid,
    provider,
    meta: {
      columnMap: mapping,
    }
  }

  try {
    const { data } = await this.$axios.post(`/promoter/${promoterOid}/custom-provider`, payload);

    return data;

  } catch (e) {
    console.error(e);
  }
}
