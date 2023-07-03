/**
 * START_EVENT_SYNC
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { String } payload.provider
 * @param { Number } payload.eventOid
 */
export async function START_EVENT_SYNC({ state, commit }, eventOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/event/${eventOid}/sync`;

  try {
    const res = await this.$axios.sg.post(url);

    // Merges may take time depending on
    if (res.status === 201) {
      return {
        accepted: true,
        event: res.data,
      }
    } else {
      throw new Error(res.data);
    }
  } catch (error) {
    const serverReason = error.message ? error.message : error;
    return {
      accepted: false,
      message: serverReason,
    }
  }
}
