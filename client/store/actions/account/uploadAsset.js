import { isErrorStatus } from "~/api/utils";
import {sanitizeFilename} from "~/utils/helpers";

/**
 * UPLOAD_ASSET
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { string } payload.eventOid
 * @param { string } payload.campaignOid
 * @param { string } payload.assetType
 * @param { string } payload.contentType
 * @param { blob } payload.file
 */
export async function UPLOAD_ASSET(
  { state },
  { eventOid, campaignOid, assetType, contentType, file }
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  // Get the upload & final url
  try {
    const { data } = await this.$axios.post(`/promoter/${promoterOid}/bucket`, {
      eventOid,
      campaignOid,
      assetType,
      contentType,
    });

    // Put the asset to the S3 bucket
    const sanitizedFile = new File([file], sanitizeFilename(file.name), { type: file.type});
    const s3PutResponse = await this.$axios.put(data.uploadParams.uploadUrl, sanitizedFile, {
      headers: {
        'Content-Type': contentType,
      },
    });

    if (isErrorStatus(s3PutResponse.status)) {
      console.log("Error uploading asset to S3", s3PutResponse);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
