

export async function FETCH_TOUR_BY_OID({ state, commit }, {oid}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if(isNaN(oid)) {
    console.error('FETCH_TOUR_BY_OID called with NaN oid');
    return;
  }

  if (!oid) console.error('FETCH_TOUR_BY_OID called with NULL oid')

  const url = `/promoter/${promoterOid}/tour/${oid}`;

  try {
    let { data } = await this.$axios.get(url);

    return data;

  } catch (error) {
    //console.error(error);
    return {};
  }
}
