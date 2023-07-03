/**
 * FETCH_STAFF_ACCOUNTS
 *
 * @param { object } context - Store context (state, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.top
 * @param { number } payload.skip
 * @param { string } payload.searchString
 *
 * This is a little different to a theoretical FETCH_PROMOTER_ACCOUNTS because
 * we're implicitly (from the consumer's perspective) filtering promoter accounts
 * where the email is in the arep.co or audiencerepublic.com domain
 */
export async function FETCH_STAFF_ACCOUNTS(
  { state, commit },
  { top = 20, skip = 0, searchString = '', onlyArEmailAddress = false }
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/account?$select=firstName,lastName,emailAddress,sysCtime,promoterOid&$top=${top}&$skip=${skip}&$count=true&$orderby=oid%20desc`;

  url += `&$filter=`;
  if (onlyArEmailAddress) {
    if (searchString) {
      url += encodeURIComponent(`sysActivep AND (emailAddress ILIKE "%@arep.co" OR emailAddress ILIKE "%@audiencerepublic.co%") AND (emailAddress ILIKE "%${searchString}%" OR firstName ILIKE "%${searchString}%" OR emailAddress ILIKE "%${searchString}%" OR firstName ILIKE "%${searchString}%")`);
    } else {
      url += encodeURIComponent(`sysActivep AND (emailAddress ILIKE "%@arep.co" OR emailAddress ILIKE "%@audiencerepublic.co%")`)
    }
  } else {
    url += encodeURIComponent(`sysActivep AND (emailAddress ILIKE "%${searchString}%" OR firstName ILIKE "%${searchString}%" OR emailAddress ILIKE "%${searchString}%" OR firstName ILIKE "%${searchString}%")`);
  }

  try {
    const { data: { rows, count }, } = await this.$axios.get(url);

    return {
      rows,
      count,
    };

  } catch (error) {
    console.error(error);
  }
}
