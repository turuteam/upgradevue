export async function UPDATE_TOUR({ state, commit }, tourDTO) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    tourDTO.promoterOid = promoterOid;
    await this.$axios.patch(`/promoter/${promoterOid}/tour/${tourDTO.oid}`, tourDTO);

    return tourDTO;
  } catch (error) {
    // TODO: Notify client
    //console.log(error);
  }
}
