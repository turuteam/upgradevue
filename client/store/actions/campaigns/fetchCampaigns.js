/**
 * FETCH_CAMPAIGNS
 *
 * @param { object } context - Store context (state, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.top
 * @param { number } payload.skip
 * @param { string } payload.searchString
 */
export async function FETCH_CAMPAIGNS(
  { state, commit },
  { top = 20, skip = 0, searchString = '', filter = 'all' }
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  // Crude way of translating from the 3 values for filter: 'all', 'active', 'inactive'
  // to the equivalent $filter expression.
  let filterQuery = '';
  if (searchString || (filter === 'active' || filter === 'inactive')) {
    const expressions = []

    if (searchString) {
      expressions.push(`name ILIKE "%${searchString}%"`)
    }
    if (filter === 'active') {
      expressions.push(`endDate > "NOW()"`)
    }
    if (filter === 'inactive') {
      expressions.push(`endDate < "NOW()"`)
    }
    expressions.push("type != opt-in AND type != rsvp")
    const filterExpr = expressions.join(" AND ");
    filterQuery += filterExpr
  } else {
    filterQuery += `type != opt-in AND type != rsvp`;
  }

  try {
    const { data: { rows, count }, } = await this.$axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
        $select: 'name,type,notifyDate,startDate,endDate,event,timeZone,presentation,urlSlug,summaryStatsSnapshot,socialActions,registrations,settings,resources,subscriptionLevel',
        $top: top,
        $skip: skip,
        $count: true,
        $orderby: 'endDate desc, sysCtime desc',
        $filter: filterQuery,
      }
    }); 

    return {
      rows,
      count,
    };

  } catch (error) {
    console.error(error);
  }
}
