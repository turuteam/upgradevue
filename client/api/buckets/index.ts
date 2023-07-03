import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { Bucket } from './types';

export default (axios: NuxtAxiosInstance) => ({
  async fetch(oid: number): Promise<Bucket> {
    const { data, status } = await axios.get(`/bucket/${oid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch asset error',
        message: `Error fetching bucket with oid of ${oid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async generatePreSignedUrl(promoterOid: number, oid: number, action: 'get' | 'put'): Promise<string> {
    const { data, status } = await axios.post(
      `/promoter/${promoterOid}/bucket/${oid}/pre-sign`,
      { action });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Pre-sign asset error',
        message: `Error pre-assigning bucket with oid of ${oid}`,
        status,
      };
      throw apiError;
    }
    return data.preSignedUrl;
  },
  /**
   * We can simply create a local bucket and put our data in "meta" field without having
   * to upload it to S3.
   */
  async createLocalBucket(promoterOid: number, assetType: string, contentType: string, meta: object) {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/bucket`, {
      assetType,
      contentType,
      meta,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create local bucket error',
        message: `Error creating local bucket`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async updateLocalBucket(bucketOid: number, meta: object) {
    const { data, status } = await axios.put(`/bucket/${bucketOid}`, {
      meta,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Update local bucket error',
        message: `Error updating local bucket`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async uploadCsv(promoterOid: number, payload: object) {
    return await axios.post(`/promoter/${promoterOid}/s3import`, payload);
  }
});
