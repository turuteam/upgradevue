/**
 * FETCH_CAMPAIGNS
 *
 * @param { object } context - Store context (state, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.top
 * @param { number } payload.skip
 * @param { string } payload.searchString
 */
export async function FETCH_TOURS(
  { state, commit },
  { top = 20, skip = 0, searchString = '' }
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/tour?$top=${top}&$skip=${skip}&$count=true&$orderby=oid%20desc`;

  url += '&$filter=user_defined=true'
  if (searchString) {
    url += ' AND ' + encodeURIComponent(`name ILIKE "%${searchString}%"`);
  }


  try {
    const { data: { rows, count }, } = await this.$axios.get(url);

    return {
      rows,
      count,
    };

  } catch (error) {
    //console.error(error);
  }
}
