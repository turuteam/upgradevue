import dayjs from 'dayjs';

/**
 * FETCH_EVENTS
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.top
 * @param { number } payload.skip
 * @param { string } payload.searchString
 */

const defaultSelectString = 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo,provider'

export async function FETCH_EVENTS({ state, commit }, { orderBy = null, top = 12, skip = 0, searchString = '', filter = '', selectString = defaultSelectString, dateRange = null , provider = null}) {
  if (!state.auth.account) return null;

  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/event?$select=${selectString}&$top=${top}&$skip=${skip}&$count=true`;

  const filterCriteria = ['userDefined'];

  if (searchString) {
    const searchBy = ['name', 'location'];

    const filterBy = searchBy.map((s) =>
      encodeURIComponent(`${s} ILIKE "%${searchString}%"`)
    );

    filterCriteria.push(`(${filterBy.join(' OR ')})`);
  }

  if (provider && provider !== 'all') {
    filterCriteria.push(`provider=${provider}`)
  }

  let filterDate;
  if (dateRange) {
    switch (dateRange.condition) {
      case 'is_equal_to':

        let startOfDay = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DDTHH:mm:ss')
        let endOfDay = dayjs(dateRange.values[0]).utc(true).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
        filterCriteria.push(`startDate > '${startOfDay}' AND startDate < '${endOfDay}'`)

        break
      case 'is_after':
        filterDate = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DD')
        filterCriteria.push(`startDate > '${filterDate}'`)

        break
      case 'is_before':
        filterDate = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
        filterCriteria.push(`startDate < '${filterDate}'`)

        break
      case 'is_between':
        let filterStart = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
        let filterEnd = dayjs(dateRange.values[1]).utc(true).format('YYYY-MM-DD')
        filterCriteria.push(`startDate > '${filterStart}'`)
        filterCriteria.push(`startDate < '${filterEnd}'`)

        break
      default:
        console.log('An unrecognised date range condition was received: ', dateRange)
    }
  }

  if (filterCriteria.length > 0) {
    url += `&$filter=${filterCriteria.join(' AND ')}`;
  }

  switch (orderBy) {
    case 'datecreated': url += '&$orderby=sysCtime desc'; break;
    case 'eventstartdateasc': url += '&$orderby=startDate asc'; break;
    case 'eventstartdatedesc': url += '&$orderby=startDate desc'; break;
    case 'alphabetically': url += '&$orderby=name asc'; break;
    default: url += `&$orderby=oid desc`
  }

  try {
    const {data: { rows, count }} = await this.$axios.get(url);

    if (!rows.length) {
      commit('event/SET_HAS_NO_MORE_EVENTS', true)
    }

    return {
      rows,
      count,
    };
  } catch (error) {
    console.error('There was an error fetching all the events in FETCH_EVENTS: ', error);
  }
}
