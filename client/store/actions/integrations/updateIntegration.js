/**
 * UPDATE_INTEGRATION
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.oid
 */
export async function UPDATE_INTEGRATION({ state }, { oid, data }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    return await this.$axios.sg.patch(`/promoter/${promoterOid}/integration/${oid}`, {
      ...data,
      // Client need to manually set status to 'in-progress
      status: 'in-progress',
    });
  } catch (e) {
    throw e;
  }
}
