import {sanitizeFilename} from "~/utils/helpers";

/**
 * PUT_ASSET
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { string } payload.eventOid
 * @param { string } payload.campaignOid
 * @param { string } payload.assetType
 * @param { string } payload.contentType
 * @param { blob } payload.file
 */
export async function PUT_ASSET(
    { commit },
    { contentType, file, resourceOid }
  ) {
    // Get the upload & final url
    try {
      const { data } = await this.$axios.get(`/bucket/${resourceOid}`);
      // Put the asset to the S3 bucket
      const sanitizedFile = new File([file], sanitizeFilename(file.name), { type: file.type});
      await this.$axios.put(data.uploadParams.uploadUrl, sanitizedFile, {
        headers: {
          'Content-Type': contentType,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }
