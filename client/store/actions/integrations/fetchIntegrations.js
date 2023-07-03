import { filterObjectToQueryString } from '@/utils/helpers';

/**
 * FETCH_INTEGRATIONS
 * Fetch the existing promoter's integrations
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_INTEGRATIONS(
  { state },
  {
    top = 3, // default is 3; one for every integration
    count = false,
    orderby = 'oid desc',
    filters = { expressions: [], logicalOperators: []}
  }
){
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    let uri = `/promoter/${promoterOid}/integration`;

    const { data } = await this.$axios.sg.get(uri, {
      params: {
        $top: top,
        $count: count,
        $orderby: orderby ? orderby : null,
        $filter: filters.expressions.length > 0 ? filterObjectToQueryString(filters) : null,
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
}
