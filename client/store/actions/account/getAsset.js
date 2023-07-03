/**
 * GET_ASSET
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 */
export async function GET_ASSET(
    { commit },
    { oid }
  ) {
    try {
      const getBucketInfoRes = await this.$axios.get(`/bucket/${oid}`);
      const getHtmlRes = await this.$axios.get(getBucketInfoRes.data.url);
      return getHtmlRes.data;
    } catch (error) {
      throw error;
    }
  }
  