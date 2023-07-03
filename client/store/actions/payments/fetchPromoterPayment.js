/**
 * FETCH_PROMOTER_PAYMENT
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_PROMOTER_PAYMENT({}, { promoterOid, planType }) {

  try {
    const { data } = await this.$axios.get(`/promoter/${promoterOid}/plan`, {
      params: {
        $planType: planType,
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
}
