import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';
import dayjs from 'dayjs';

export default (axios: NuxtAxiosInstance) => ({

  async fetchAll(
    promoterOid: number,
    options: {
      taskStatus?: string[],
      notTaskStatus?: string[],
      startedAfter?: string,
      top?: number,
      skip?: boolean,
    }
  ): Promise<PromoterIntegrationTask[]> {
    let filterString = `promoterOid = ${promoterOid} AND name != automation-block-message`;
    if (options.taskStatus && options.taskStatus.length > 0) {
      let thisString = `status = ${options.taskStatus.join(` OR ${filterString} AND status = `)}`;
      filterString = `${filterString} AND ${thisString}`;
    } else if (options.notTaskStatus && options.notTaskStatus.length > 0) {
      let thisString = `status != ${options.notTaskStatus.join(" AND status != ")}`;
      filterString = `${filterString} AND ${thisString}`;
    }


    if (options.startedAfter) {
      const thisString = `sys_mtime > '${dayjs(options.startedAfter).format('YYYY-MM-DDTHH:mm:ss[Z]') }'`
      filterString = filterString.length == 0 ? thisString : `${filterString} AND ${thisString}`
    }

    let topValue = options.top ? options.top : 15;
    let skipValue = options.skip ? options.skip : 0;

    const { data, status } = await axios.get(`/promoter/${promoterOid}/task`, {
      params: {
        $top: topValue,
        $skip: skipValue,
        $filter: filterString,
        $orderby: 'sys_mtime DESC'
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Promoter Task error',
        message: `Error getting Promoter Tasks for promoter ${promoterOid}.`,
        status,
      };
      throw apiError;
    }
    // TODO - Remove the filter once backend has been updated
    return data.filter((item: any) => !!options.startedAfter ? dayjs(item.started).isAfter(options.startedAfter) : true);
  },


  async fetchTasksOfTypes(
    promoterOid: number,
    options: {
      taskStatus?: string,
      notTaskStatus?: string[],
      types: string[],
      hasMessageListOid?: boolean,
      hasEventOid?: boolean,
      startedAfter?: string,
    },
  ): Promise<PromoterIntegrationTask[]> {

    let leftFilterString = `promoterOid = ${promoterOid}`;

    let totalFilterString = ``;
    if (options.taskStatus && options.taskStatus.length > 0) {
      let thisString = `status = ${options.taskStatus}`;
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`;
    }
    if (options.notTaskStatus && options.notTaskStatus.length > 0) {
      let thisString = `status != ${options.notTaskStatus.join(" AND status != ")}`;
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`;
    }
    if (options.hasMessageListOid) {
      const thisString = `messageListOid != NULL`;
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`;
    }
    if (options.hasEventOid) {
      const thisString = `eventOid != NULL`;
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`;
    }

    if (options.types.length === 0) {
      const thisString = `name != automation-block-message`;
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`;
    }

    if (options.startedAfter) {
      const thisString = `sys_mtime > '${dayjs(options.startedAfter).format('YYYY-MM-DDTHH:mm:ss[Z]')}'`
      leftFilterString = leftFilterString.length == 0 ? thisString : `${leftFilterString} AND ${thisString}`
    }

    options.types.forEach(type => {
      const thisString = `name = ${type}`;
      if (totalFilterString.length === 0) {
        totalFilterString = `${leftFilterString} AND ${thisString}`
      } else {
        totalFilterString = `${totalFilterString} OR ${leftFilterString} AND ${thisString}`
      }
    })

    const { data, status } = await axios.get(`/promoter/${promoterOid}/task`, {
      params: {
        $top: 15,
        $filter: totalFilterString,
        $orderby: 'sys_mtime DESC'
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Promoter Task error',
        message: `Error getting Promoter Tasks for promoter ${promoterOid}.`,
        status,
      };
      throw apiError;
    }
    // TODO - Remove the filter once backend has been updated and add $filter above
    return data.filter((item: any) => !!options.startedAfter ? dayjs(item.started).isAfter(options.startedAfter) : true);
  },

});
