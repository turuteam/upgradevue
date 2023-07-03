/**
 * FETCH_EVENT_SYNC_TASKS
 * Fetch the existing promoter's integration tasks
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_EVENT_SYNC_TASKS({ state }, { promoterIntegrationOid, orderby, top}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    let url = `/promoter/${promoterOid}/integration/${promoterIntegrationOid}/task?$top=${top || 10}`;

    url += `&$filter=${encodeURIComponent(`promoterIntegrationOid=${promoterIntegrationOid} AND name="event-data-synch" AND status != failed`)}`;

    if (orderby) {
      let orderParam = `&$orderby=${encodeURIComponent(orderby)}`;
      url += orderParam;
    }

    const { data } = await this.$axios.sg.get(url);
    return data;
  } catch (error) {
    throw error;
  }
}
