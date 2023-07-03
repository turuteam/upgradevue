/**
 * FETCH_MESSAGE_STATS_BY_OID
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } messageOid
 * @returns
 */
export async function FETCH_MESSAGE_STATS_BY_OID(
  { state },
  { oid }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if (isNaN(oid)) {
    console.error('FETCH_MESSAGE_STATS_BY_OID called with NaN oid');
    return;
  }

  let uri = `/promoter/${promoterOid}/task-stats-realtime/${oid}`;

  try {
    const {
      data
    } = await this.$axios.get(uri);

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
