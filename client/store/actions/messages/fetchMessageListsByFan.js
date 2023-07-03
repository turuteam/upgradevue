/**
 * FETCH_MESSAGE_LISTS_BY_FAN
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } fanOid
 * @returns
 */
export async function FETCH_MESSAGE_LISTS_BY_FAN(
  { state },
  {
    top = 50,
    skip = 0,
    orderBy = { key: 'oid', order: 'desc' },
    fanOid = null,
    userDefined = true,
  }) {
    if (!state.auth.account) { return null; }
    const { promoterOid } = state.auth.account;
    if(!fanOid) return [];

    try {
      let uri = `/promoter/${promoterOid}/fan-message-list-subscription?$top=${top}&$skip=${skip}&$orderby=${orderBy.key}%20${orderBy.order}&$count=true`;
      let filterString = `fanOid=${fanOid}`;
      if (userDefined === true) {
        filterString += ` AND userDefined = true`
      } else if (userDefined === false) {
        filterString += ` AND userDefined != true`
      }
      uri += `&$filter=${encodeURIComponent(filterString)}&$select=messageList,sms,email,facebookMessenger`;

      const { data: { rows, count } } = await this.$axios.get(uri);

      return {
        rows,
        count,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
}
