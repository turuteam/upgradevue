import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { ActionResponse, AutomationResponse, TriggerResponse } from "~/store/modules/automation/types";

export default (axios: NuxtAxiosInstance) => ({

  async create(promoterOid: number, name: string): Promise<AutomationResponse> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/automation_chart`, { name })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create automation error',
        message: `Error creating new Automation with promoterOid ${promoterOid},\n
                  and Automation name of ${name}.`,
        status,
      }
      throw apiError
    }
    return data
  },

  async rename(promoterOid: number, chartOid: number, name: string): Promise<void> {
    const { status } = await axios.patch(`/promoter/${promoterOid}/automation_chart/${chartOid}`, {
      oid: chartOid,
      name,
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Rename automation error',
        message: `Error renaming Automation with promoterOid ${promoterOid},\n
                  chartOid of ${chartOid},\n
                  and Automation name of ${name}.`,
        status,
      }
      throw apiError
    }
  },

  async addTrigger(promoterOid: number, chartOid: number, itemType: string): Promise<TriggerResponse> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/add_trigger`, {
      type: itemType,
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Add trigger to automation error',
        message: `Error adding trigger to Automation with promoterOid ${promoterOid},\n
        chartOid of ${chartOid},\n
        and Automation item type ${itemType}.`,
        status,
      }
      throw apiError
    }

    return data.trigger
  },

  async addBlock(promoterOid: number, chartOid: number, itemType: string, parentBoxOid: number | null): Promise<ActionResponse> {

    let { data, status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/add_block`, {
      parent_box_oid: parentBoxOid,
      type: itemType,
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Add block to automation error',
        message: `Error adding block to Automation with promoterOid ${promoterOid},\n
                  chartOid of ${chartOid},\n
                  and Automation item type ${itemType}.`,
        status,
      }
      throw apiError
    }

    return data
  },

  async updateItemConfig(promoterOid: number, chartOid: number, type: string, id: number, itemConfig: any): Promise<TriggerResponse | ActionResponse> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/${type}/${id}/configuration`, {
      ...itemConfig,
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Update automation item config error',
        message: `Error updating Automation item config with promoterOid ${promoterOid}, \n
                  chartOid of ${chartOid}, \n
                  type of ${type},\n
                  id of ${id},\n
                  and item config of ${itemConfig}.\n`,
        status,
      }
      throw apiError
    }

    return data.config
  },

  async start(promoterOid: number, chartOid: number): Promise<void> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/start`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Start automation error',
        message: `Error starting Automation with promoterOid ${promoterOid}, \n
                  and chartOid of ${chartOid}`,
        status,
      }
      throw apiError
    }
  },

  async pause(promoterOid: number, chartOid: number): Promise<void> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/pause`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Pause automation error',
        message: `Error pausing Automation with promoterOid ${promoterOid}, \n
                  and chartOid of ${chartOid}`,
        status,
      }
      throw apiError
    }
  },

  async stop(promoterOid: number, chartOid: number): Promise<void> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/stop`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Stop automation error',
        message: `Error stopping Automation with promoterOid ${promoterOid}, \n
                  and chartOid of ${chartOid}`,
        status,
      }
      throw apiError
    }
  },

  async delete(promoterOid: number, chartOid: number): Promise<void> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/automation_chart/${chartOid}`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete automation error',
        message: `Error deleting Automation with promoterOid ${promoterOid}, \n
                  and chartOid of ${chartOid}`,
        status,
      }
      throw apiError
    }
  },

  async duplicate(promoterOid: number, chartOid: number): Promise<void> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${chartOid}/duplicate`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Duplicate automation error',
        message: `Error duplicating Automation with promoterOid ${promoterOid}, \n
                  and chartOid of ${chartOid}`,
        status,
      }
      throw apiError
    }
  },

  async fetchAutomations(promoterOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/automation_chart`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch automations error',
        message: `Error fetching Automations with promoterOid ${promoterOid}`,
        status,
      }
      throw apiError
    }

    return data
  },

  async fetchAutomation(promoterOid: number, automationOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/automation_chart/${automationOid}/full`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch automation error',
        message: `Error fetching Automation with promoterOid ${promoterOid},\n
                  and automationOid of ${automationOid}`,
        status,
      }
      throw apiError
    }

    return data
  },

  async fetchAutomationSimple(promoterOid: number, automationOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/automation_chart/${automationOid}`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch automation simple error',
        message: `Error fetching simple Automation with promoterOid ${promoterOid},\n
                  and automationOid of ${automationOid}`,
        status,
      }
      throw apiError
    }
    return data
  },

  async moveBlock(promoterOid: number, automationOid: number, movedBlockOid: number, newParentOutBoxOid: number | null): Promise<any> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${automationOid}/block/${movedBlockOid}/move`, {
      "to-box-oid": movedBlockOid,
      "new-from-box-oid": newParentOutBoxOid,
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Reorder block error',
        message: `Error reordering block with promoterOid ${promoterOid},\n
                  automationOid of ${automationOid},\n
                  movedBlockOid of ${movedBlockOid},\n
                  and newParentOutBoxOid of ${newParentOutBoxOid}`,
        status,
      }
      throw apiError
    }
  },

  async reorderBlock(promoterOid: number, automationOid: number, movedBlockOid: number, newParentOutBoxOid: number | null): Promise<any> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${automationOid}/block/${movedBlockOid}/reorder`, {
      "new-from-box-oid": newParentOutBoxOid,
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Reorder block error',
        message: `Error reordering block with promoterOid ${promoterOid},\n
                  automationOid of ${automationOid},\n
                  movedBlockOid of ${movedBlockOid},\n
                  and newParentOutBoxOid of ${newParentOutBoxOid}`,
        status,
      }
      throw apiError
    }
    return data
  },

  async deleteBlock(promoterOid: number, automationOid: number, blockOid: number): Promise<any> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/automation_chart/${automationOid}/block/${blockOid}`)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete block error',
        message: `Error deleting block with promoterOid ${promoterOid},\n
                  automationOid of ${automationOid},\n
                  and blockOid of ${blockOid}`,
        status,
      }
      throw apiError
    }
  },

  async deleteTrigger(promoterOid: number, automationOid: number, triggerOid: number): Promise<any> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/automation_chart/${automationOid}/trigger/${triggerOid}`)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete trigger error',
        message: `Error deleting trigger with promoterOid ${promoterOid},\n
                  automationOid of ${automationOid},\n
                  and triggerOid of ${triggerOid}`,
        status,
      }
      throw apiError
    }
  },

  async createFilterGroup(promoterOid: number, name: string, filter: any, favourite: boolean, userDefined: boolean, version: number, automationOid: number): Promise<any> {
    let { data, status } = await axios.post(`promoter/${promoterOid}/filter-group`, {
      promoterOid, name, filter, favourite, userDefined, version
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - CreateFilterGroup error',
        message: `Error creating automation filter group with promoterOid ${promoterOid},\n
                  automationOid of ${automationOid}`,
        status,
      }
      throw apiError
    }
    return data
  },

  async addIfElseFilter(promoterOid: number, automationOid: number, blockOid: number, config: any): Promise<any> {
    const { status } = await axios.post(`/promoter/${promoterOid}/automation_chart/${automationOid}/block/${blockOid}/configuration`, config)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - addIfElseFilter error',
        message: `Error updating automation if/else config with promoterOid of ${promoterOid},\n
                  automationOid of ${automationOid},\n
                  blockOid of ${blockOid},\n
                  and filter-group-oid of ${config["filter-group-oid"]}`,
        status,
      }
      throw apiError
    }
  },
  async updateFilterCondition(promoterOid: number, filterGroupOid: number, filter: any): Promise<any> {
    const { status } = await axios.patch(`/promoter/${promoterOid}/filter-group/${filterGroupOid}`, {
      filter,
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - updateFilterCondition error',
        message: `Error updating automation if/else condition with promoterOid of ${promoterOid},\n
                  filterGroupOid of ${filterGroupOid},\n
                  and filter of ${filter}`,
        status,
      }
      throw apiError
    }
  },
  async getFilterGroup(promoterOid: number, filterGroupOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/filter-group/${filterGroupOid}`)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - getFilterGroup error',
        message: `Error fetching automation filter group with promoterOid of ${promoterOid},\n
                  and filterGroupOid of ${filterGroupOid}`,
        status,
      }
      throw apiError
    }

    return data
  },
  async getMessageLists(promoterOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $top: 'all',
        $orderby: 'sysMtime desc',
        $filter: 'userDefined = true',
      }
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - getMessageLists error',
        message: `Error fetching message lists with promoterOid of ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data
  },
  async getCampaigns(promoterOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
        $select: 'name',
        $top: '200',
        $orderby: 'endDate desc',
        $filter: 'type != "rsvp" AND type != "opt-in"',
      }
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - getCampaigns error',
        message: `Error fetching campaign list with promoterOid of ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data
  },
  async getProducts(promoterOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/product`, {
      params: {
        $select: 'title,vendor',
        $top: 'all',
        $orderBy: 'sysMtime desc',
      }
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - getProducts error',
        message: `Error fetching products with promoterOid of ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data
  },
  async getProduct(promoterOid: number, productOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/product/${productOid}`)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - getProduct error',
        message: `Error fetching product with promoterOid of ${promoterOid},\n
                  and productOid of ${productOid}`,
        status,
      }
      throw apiError
    }
    return data
  }
})