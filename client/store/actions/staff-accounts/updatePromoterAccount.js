/**
 * UPDATE_PROMOTER_ACCOUNT
 */

export async function UPDATE_PROMOTER_ACCOUNT({ state, commit }, accountObj) {
  try {
    await this.$axios.patch(`/promoter/${accountObj.promoterOid}/account/${accountObj.oid}`, accountObj);
    return accountObj;
  } catch (error) {
    // TODO: Notify client
    console.log(error);
    throw error;
  }
}
