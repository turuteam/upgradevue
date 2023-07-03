/**
 * STOP_INTEGRATION_SYNC
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { Number } integrationOid
 */
export async function STOP_INTEGRATION_SYNC({ state, commit }, integrationOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/integration/${integrationOid}/sync-stop`;

  try {
    const res = await this.$axios.sg.post(url);

    if (res.status === 201) {
      return {
        accepted: true,
        data: res.data,
      };
    } else {
      throw Error(res.statusText);
    }
  } catch (error) {
    const serverReason = error.message ? error.message : error;
    return {
      accepted: false,
      message: serverReason,
    }
  }
}
