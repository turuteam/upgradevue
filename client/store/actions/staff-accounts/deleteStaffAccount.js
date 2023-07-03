/**
 * DELETE_STAFF_ACCOUNT
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } promoterOid
 * @param { number } accountOid
 *
 * This will delete the promoter-account but keep promoter
 */

export async function DELETE_STAFF_ACCOUNT({}, { promoterOid, accountOid }) {
  await this.$axios.delete(`/promoter/${promoterOid}/account/${accountOid}`);
}
