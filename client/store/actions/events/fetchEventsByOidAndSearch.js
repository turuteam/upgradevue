/**
 * FETCH_EVENTS_BY_OID
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { array } payload.oids
 */

export async function FETCH_EVENTS_BY_OID_AND_SEARCH({ state, commit }, {oids, searchString}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if (!oids || oids.length === 0) {
    return [];
  }

  let url = `/promoter/${promoterOid}/event?$select=name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo&$top=all&$orderby=oid%20desc&$filter=`;

  const oidsRequest = `oid=${ oids.join(' OR oid=')}`;
  url += searchString ? `%28${encodeURIComponent(oidsRequest)}%29` : encodeURIComponent(oidsRequest);

  if (searchString && searchString.length > 0) {
    const encodedComponent = encodeURIComponent(`name ILIKE "%${searchString}%"`);
    url += `${encodeURIComponent(" AND ")}%28${encodedComponent}%29`;
  }

  try {
    const { data } = await this.$axios.get(url);

    return data;

  } catch (error) {
    console.error(error);
    return [];
  }
}
