import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EventAnnotation, EventAnnotationPostResponse, UpdateAnnotationPayload } from '@/store/modules/event/types';
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export default (axios: NuxtAxiosInstance) => ({

  /**
   * Update an annotation for this event with the given eventOid
   * @param promoterOid
   * @param eventOid
   * @param annotation
  */
  async update(promoterOid: number, eventOid: number, annotation: UpdateAnnotationPayload): Promise<void> {

    try {
      let { status, statusText } = await axios.patch(`/promoter/${promoterOid}/event/${eventOid}/graph-annotation/${annotation.oid}`, {
        body: annotation.body,
      })
      if (isErrorStatus(status)) {
        let apiError: CustomApiError = {
          name: 'Update Annotation error',
          message: `Error Updating Annotation for event with oid: ${eventOid}, annototation with id: ${annotation.oid}\nResponse text: ${statusText}`,
          status,
        }

        throw apiError
      }

    } catch (error) {
      throw error
    }
  },
  
  /**
   * Delete an annotation for this event with the given eventOid
   * @param promoterOid
   * @param eventOid
   * @param annotationOid
  */
  async delete(promoterOid: number, eventOid: number, annotationOid: number): Promise<void> {

    try {
      let { status, statusText } = await axios.delete(`/promoter/${promoterOid}/event/${eventOid}/graph-annotation/${annotationOid}`)
      if (isErrorStatus(status)) {
        let apiError: CustomApiError = {
          name: 'Delete Annotations error',
          message: `Error Deleting Annotation for event with oid: ${eventOid}, annototation with id: ${annotationOid}\nResponse text: ${statusText}`,
          status,
        }
  
        throw apiError
      }
    } catch (error) {
      throw error
    }
  },
  
  /**
   * Fetch all annotations for this event with the given eventOid
   * @param promoterOid 
   * @param eventOid 
   * @returns
  */
  async get(promoterOid: number, eventOid: number): Promise<EventAnnotationPostResponse[]> {

    try {
      let { data, status, statusText } = await axios.get(`/promoter/${promoterOid}/event/${eventOid}/graph-annotation`, {
        params: {
          $filter: `eventOid = ${eventOid}`,
        }
      })
      if (isErrorStatus(status)) {
        let apiError: CustomApiError = {
          name: 'Get Annotations error',
          message: `Error Fetching Annotations for event with oid of ${eventOid}\nResponse text: ${statusText}`,
          status,
        }

        throw apiError
      }

      return data
    } catch (error) {
      throw error
    }
  },

  /**
   * Create an annotation for this event with the given eventOid
   * @param promoterOid 
   * @param eventOid 
   * @returns
  */
  async create(promoterOid: number, eventOid: number, annotation: EventAnnotation): Promise<EventAnnotationPostResponse> {

    try {
      let { data, status, statusText } = await axios.post(`/promoter/${promoterOid}/event/${eventOid}/graph-annotation`, { ...annotation })
      if (isErrorStatus(status)) {
        let apiError: CustomApiError = {
          name: 'Create Annotation error',
          message: `Error creating Annotation for event with oid of ${eventOid}\nResponse text: ${statusText}`,
          status,
        }

        throw apiError
      }

      return data

    } catch (error) {
      throw error
    }
  }
})