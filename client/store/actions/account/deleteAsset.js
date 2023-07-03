export async function DELETE_ASSET(
  { state },
  oid,
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;
  try {
    await this.$axios.delete(`/promoter/${promoterOid}/bucket/${oid}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
