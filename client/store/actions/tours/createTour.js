export async function CREATE_TOUR({ state, commit }, tourDTO) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    tourDTO.promoterOid = promoterOid;
    const { data } = await this.$axios.post(`/promoter/${promoterOid}/tour`, tourDTO);

    return data;
  } catch (error) {
    //console.log(error);
  }
}
