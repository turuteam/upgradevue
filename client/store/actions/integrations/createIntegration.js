/**
 * CREATE_INTEGRATION
 *
 * Create a new integration
 * @param { Object } payload Object containing OAuth & current's promoter data:
 * @param { number } payload.promoterOid Promoter's oid
 * @param { string } payload.provider Provider (e.g: 'facebook')
 * @param { object } payload.oauthToken OAuthToken object
 * @param { string } payload.oauthToken.accessToken Access Token
 */
export async function CREATE_INTEGRATION({ state }, { provider, app, oauthToken, integration }) {
  if (!state.auth.account) { return null; }
  const { promoterOid, oid } = state.auth.account;

  try {
    const body = {
      provider,
      app,
      oauthToken,
      promoterOid,
      promoterAccountOid: oid,
      integration,
    };
    const { data } = await this.$axios.sg.post(`/promoter/${promoterOid}/integration`, body);

    return data;
  } catch (e) {
    throw e;
  }
}
