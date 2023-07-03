/**
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.integrationOid
 */
export async function DELETE_CUSTOM_AUDIENCE_INTEGRATION(
  { dispatch, commit },
  { promoterOid, integrationOid }) {
  // data
  try {
    console.log('DELETE_CUSTOM_AUDIENCE_INTEGRATION integrationOid %s ', integrationOid);
    await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${integrationOid}`);

  } catch (e) {
    console.error(e);
    // VueNotifications.error({
    //   message: `Failed to update the existing integration, please try again.`,
    // });
  }
}
