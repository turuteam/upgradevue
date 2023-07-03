/**
 * STOP_EVENT_SYNC
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } provider -
 */
export async function STOP_EVENT_SYNC({ state, commit }, provider) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/event-sync-stop`;

  try {
    const res = await this.$axios.sg.post(url, {});
    let message = '';

    // Merges may take time depending on
    if (res.status === 202) {
      message = `${provider} sync has been stopped successfully`;
    } else {
      throw new Error('Sync failed with HTTP code ', res.status)
    }

    return {
      type: 'ACCEPTED',
      message,
    }
  } catch (error) {
    const serverReason = error.message ? error.message : error;
    return {
      type: 'REJECTED',
      message: serverReason,
    }
  }
}
