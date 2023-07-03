/**
 *
 * Update an existing integration
 * @param { object } payload
 * @param { object } payload.data Object containing OAuth & current's promoter data
 * @param { number } payload.integrationOid
 */
export async function DELETE_CUSTOM_PROVIDER(
  { dispatch, commit },
  { data }) {
  // data
  const { promoterOid, providerOid } = data;

  try {
    await this.$axios.delete(`/promoter/${promoterOid}/custom-provider/${providerOid}`);

  } catch (e) {
    console.error(e);
  }
}
