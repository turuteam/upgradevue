/**
 * START_INTEGRATION_SYNC
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { Number } integrationOid
 */
export async function START_INTEGRATION_SYNC({ state, commit }, integrationOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/integration/${integrationOid}/sync`;

  try {
    const res = await this.$axios.sg.post(url);
    // In following with
    let newIntegrationTask;
    if (res.status === 201) {
      newIntegrationTask = res.data;
    }

    return {
      accepted: true,
      newIntegrationTask,
    }
  } catch (error) {
    const serverReason = error.message ? error.message : error;
    return {
      accepted: false,
      message: serverReason,
    }
  }
}
