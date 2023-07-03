import { defaultSelectFields } from '@/api/campaigns';

/**
 * FETCH_CAMPAIGNS_BY_OID
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { array } payload.oids
 */

export async function FETCH_CAMPAIGNS_BY_OID_AND_SEARCH({ state, commit }, {oids, searchString, allowOptIns = false}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  if (!oids || oids.length === 0) {
    return [];
  }

  let url = `/promoter/${promoterOid}/campaign`;
  let filterString = '';
  if (searchString && searchString.length > 0) {
    filterString += `name ILIKE "%${searchString}%" AND `
  }
  if (!allowOptIns) {
    filterString += `type != opt-in AND type != rsvp AND `
  }
  const oidsRequest = `oid=${ oids.join(' OR oid=')}`;
  filterString += `(${oidsRequest})`;

  const params = {
    $select: defaultSelectFields,
    $top: 'all',
    $orderby: 'oid desc',
    $filter: filterString
  };


  try {
    let { data } = await this.$axios.get(url, {params});
    return data;
  } catch (error) {
    return [];
  }
}
