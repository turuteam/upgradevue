import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { AutomationState } from './types';
import { getAutomationAction, getTriggers, formattedAPIBox, getActionBlock } from './utils';

export const automationActions: ActionTree<AutomationState, RootState> = {
  CLEAR_EDITABLE({ commit }, selectedTab) {
    commit('clearEditable', selectedTab)
  },
  SET_EDITABLE_ITEM({ commit }, item) {
    commit('setEditableItem', item)
  },
  FIND_AND_SET_EDITABLE_TRIGGER({ commit, state }, id) {
    let triggerItem = state.triggers.items.find(item => item.id === id)
    commit('setEditableItem', triggerItem)
  },
  FIND_AND_SET_EDITABLE_ACTION({ commit, state }, id) {
    let actionBox = getAutomationAction(state.actions, id)
    commit('setEditableItem', actionBox.block)
  },
  async NEW_AUTOMATION({ commit, rootState }, name) {
    let { promoterOid } = rootState.auth.account!

    try {
      let data = await this.$api.automation.create(promoterOid, name)
      commit('newAutomation', data)
      return data
    } catch (error) {
      console.log(error)
    }

  },
  async RENAME_AUTOMATION({ commit, rootState }, { id, name }) {
    let { promoterOid } = rootState.auth.account!

    try {
      await this.$api.automation.rename(promoterOid, id, name)
      commit('renameAutomation', name)
    } catch (error) {
      console.log(error)
    }
  },
  async UPDATE_TRIGGER_CONTEXT_DATA({ state, commit, rootState }, { id, data }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!
    let meta = data?.meta ? data?.meta : {}

    let trigger = state.triggers.items.find(item => item.id === id)
    let response = await this.$api.automation.updateItemConfig(promoterOid, automationId, 'trigger', id, data.config)
    commit('updateContextData', { item: trigger, config: response, meta: meta })
    commit('setSidebarTab', 'actions')
  },

  async UPDATE_ACTION_CONFIG({ state, commit, rootState }, { id, data }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!
    let meta = data?.meta ? data?.meta : {}

    let actionBox = getAutomationAction(state.actions, id)
    if (!actionBox) {
      throw new Error(`Unable to find action block with id: ${id}`)
    }

    try {
      let response = await this.$api.automation.updateItemConfig(promoterOid, automationId, 'block', id, data.config)
      commit('updateContextData', { item: actionBox.block, config: response, meta: meta })
      commit('actionConfigHasUpdated')

    } catch (error) {
      let errObj: any = Object.assign({}, error)
      if (errObj['response'].data.message.details.includes("Operation can only be performed if chart's status is")) {
        this.$arNotification.push({ type: 'error', message: `Please change status of Automation before modifying.` })
      }
    }
  },

  async START({ state, dispatch, commit, rootState }, payload) {
    let { promoterOid } = rootState.auth.account!
    let automationId = payload?.id ? payload.id : state.id!
    let origStatus = state.status

    try {
      await this.$api.automation.start(promoterOid, automationId)
      commit('updateStatus', 'should-start')
    } catch (error) {
      commit('updateStatus', origStatus)
      throw error
    }

    dispatch('FETCH_AUTOMATIONS')
  },
  async PAUSE({ state, commit, rootState }, payload) {
    let { promoterOid } = rootState.auth.account!
    let automationId = payload?.id ? payload.id : state.id!
    let origStatus = state.status

    try {
      await this.$api.automation.pause(promoterOid, automationId)
      commit('updateStatus', 'should-pause')
    } catch (error) {
      commit('updateStatus', origStatus)
      throw error
    }
  },
  async STOP({ state, commit, rootState }, payload) {
    let { promoterOid } = rootState.auth.account!
    let automationId = payload?.id ? payload.id : state.id!
    let origStatus = state.status

    try {
      await this.$api.automation.stop(promoterOid, automationId)
      commit('updateStatus', 'should-stop')
    } catch (error) {
      commit('updateStatus', origStatus)
      throw error
    }
  },
  async DELETE({ state, commit, rootState }, { id, skipListFilter = false }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = id ? id : state.id!

    await this.$api.automation.delete(promoterOid, automationId)

    if (!skipListFilter) {
      commit('removeAutomationFromList', automationId)
    }
  },
  async DUPLICATE({ state, dispatch, rootState }, payload) {
    let { promoterOid } = rootState.auth.account!
    let automationId = payload?.id ? payload.id : state.id!
    await this.$api.automation.duplicate(promoterOid, automationId)
    dispatch('FETCH_AUTOMATIONS')
  },
  async FETCH_AUTOMATIONS({ commit, rootState }) {
    let { promoterOid } = rootState.auth.account!
    
    try {
      commit('setLoading', true)
      let data = await this.$api.automation.fetchAutomations(promoterOid)
      commit('setAutomationsList', data)
    } catch (error) {
      console.log(`There was an error when trying to fetch all the automations: `, error)
    } finally {
      commit('setLoading', false)
    }
  },
  CLEAR_AUTOMATION({ commit }) {
    commit('clearAutomation')
  },
  async FETCH_TAGS({ commit, rootState }, {filterString}) {
    let { promoterOid } = rootState.auth.account!
    try {
      let tags = await this.$api.tags.get(promoterOid, { filterString })
      commit('tag/SET_TAGS', tags, { root: true })
      return tags
    } catch (error) {
      console.error(error)
    }
  },
  async SET_TRIGGERS({ dispatch, commit }, { data, promoterOid }) {
    if (!Object.keys(data.triggers).length) {
      return
    }
    let formattedTriggers = await getTriggers(data.triggers, promoterOid, data.chart.oid)
    let i = 0
    while (i < formattedTriggers.length) {
      commit('addTrigger', formattedTriggers[i])
      i++
    }
    dispatch('PRE_FETCH_TRIGGER_LISTS', formattedTriggers)
  },
  // pre fetch list data here to populate relevant dropdowns
  // to stop selected item/UI flashing while fetching live
  async PRE_FETCH_TRIGGER_LISTS({ dispatch }, triggers) {
    let i = triggers.length
    while (i--) {
      switch (triggers[i].key) {
        case 'purchased.product-from-store':
          dispatch('FETCH_PRODUCTS')
          break
      }
    }
  },
  async FETCH_AUTOMATION_DATA({ rootState }, id) {
    let { promoterOid } = rootState.auth.account!
    try {
      let data = await this.$api.automation.fetchAutomation(promoterOid, id)
      return data
    } catch (error) {
      console.log(`There was an error when trying to fetch the automation with id ${id}: `, error)
    }
  },
  async FETCH_AND_SET_AUTOMATION({ dispatch, commit, rootState }, { id }) {
    let { promoterOid } = rootState.auth.account!

    try {
      commit('setLoading', true)
      let data = await dispatch('FETCH_AUTOMATION_DATA', id)
      commit('setAutomationBasicDetails', { chart: data.chart, rootBoxId: data['root-box-oid'] })

      dispatch('SET_CHILD_ACTIONS', data)
      dispatch('SET_TRIGGERS', { data, promoterOid })
    } catch (error) {
      console.log(`There was an error when trying to fetch the automation with id ${id}: `, error)
    } finally {
      commit('setLoading', false)
    }
  },
  SET_LOADING({ commit }, bool) {
    commit('setLoading', bool)
  },
  async SET_CHILD_ACTIONS({ state, commit, rootState }, data) {
    let { promoterOid } = rootState.auth.account!
    let rootBoxId = state.rootBoxId!
    let outIds = []
    let boxes: any = []
    let actionRowsCount = 1

    if (!outIds.length) {
      outIds.push({ id: rootBoxId })
    }

    const buildChart = async (outIds: any) => {
      let localBoxes = []
      let nextOutIds = []
      let i = 0
      while (i < outIds.length) {
        let actionBox, formattedActionBox, selfBoxId, parentOutBoxId

        if (outIds[i]?.type === 'placeholder') {
          // placholder, add placeholder block in this row also
          localBoxes.push({ type: 'placeholder' })
          nextOutIds.push({ type: 'placeholder' })
          i++
          continue
        }

        let link = data.links['by-from-box-oid'][outIds[i]?.id]
        if (!link) {
          // we've hit the bottom of this branch, add a prompt block
          localBoxes.push({ type: 'action-prompt', parentOutBoxId: outIds[i].id, branch: outIds[i]?.branch || null })
          nextOutIds.push({ type: 'placeholder' })
        } else {
          // we have a valid link and box
          let box = data.boxes[link['to-box-oid']]
          if (!box || !box?.['block-oid']) {
            debugger
          }
          let block = data.blocks[box['block-oid']]
          parentOutBoxId = link['from-box-oid']
          selfBoxId = data.blocks[data.boxes[link['to-box-oid']]['block-oid']].boxes.self[0].oid

          if (block.type === 'control.if-else') {
            let thenBoxId, elseBoxId
            block.boxes.out.filter((item: any) => {
              if (item.name === 'then') {
                thenBoxId = item.oid
              } else {
                elseBoxId = item.oid
              }
            })

            actionBox = {
              id: {
                self: selfBoxId,
                outElse: elseBoxId,
                outThen: thenBoxId,
              },
              parentOutBoxId,
              block: {
                ...data.blocks[data.boxes[link['to-box-oid']]['block-oid']],
                parentOutBoxId,
              }
            }

            formattedActionBox = await formattedAPIBox(actionBox, promoterOid, data.chart.oid)

            localBoxes.push({ ...formattedActionBox, branch: outIds[i]?.branch || null })
            nextOutIds.push({ id: thenBoxId, branch: 'TRUE' })
            nextOutIds.push({ id: elseBoxId, branch: 'FALSE' })
          } else {
            let outBoxId = data.blocks[data.boxes[link['to-box-oid']]['block-oid']].boxes.out[0].oid

            actionBox = {
              id: {
                self: selfBoxId,
                out: outBoxId,
              },
              parentOutBoxId,
              block: {
                ...data.blocks[data.boxes[link['to-box-oid']]['block-oid']],
                parentOutBoxId,
              }
            }

            formattedActionBox = await formattedAPIBox(actionBox, promoterOid, data.chart.oid)
            localBoxes.push({ ...formattedActionBox, branch: outIds[i]?.branch || null })
            nextOutIds.push({ id: block.boxes.out[0].oid })
          }
        }

        i++
      }

      boxes.push(localBoxes)
      if (localBoxes.length > actionRowsCount) {
        actionRowsCount = localBoxes.length
      }
      let nextOutIdsActual = nextOutIds.filter(item => {
        return item?.id
      })
      if (!nextOutIdsActual.length) {
        outIds = null
      } else {
        outIds = nextOutIds
      }

      if (!outIds) {
        commit('addBoxes', boxes)
      } else {
        await buildChart(outIds)
      }
    }

    await buildChart(outIds)
  },

  async ADD_TRIGGER({ state, commit, rootState }, trigger) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!
    let itemType = `${trigger.type}.${trigger.key}`

    try {
      let resp = await this.$api.automation.addTrigger(promoterOid, automationId, itemType)
      trigger.id = resp.oid

      commit('addTrigger', trigger)
      commit('setEditableItem', trigger)
    } catch (error) {
      console.log('There was an error trying to create a trigger: ', error)
    }
  },
  async ADD_ACTION({ state, dispatch, commit, rootState }, { box, parentId }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!
    let blockType = `${box.block.type}.${box.block.key}`

    try {
      let resp = await this.$api.automation.addBlock(promoterOid, automationId, blockType, parentId)
      let { full, ...createdBlock } = resp
      let outBoxId = createdBlock.boxes.find((item: any) => item.type === 'out').oid

      let actionBox = {
        ...box,
        id: {
          self: createdBlock['parent-link']['to-box-oid'],
          out: outBoxId,
        },
        parentId,
        block: {
          ...box.block,
          id: createdBlock.block.oid,
          parentId,
        },
      }

      dispatch('SET_CHILD_ACTIONS', full)
      commit('setEditableItem', actionBox.block)
    } catch (error) {
      console.log('There was an error trying to create an action: ', error)
      throw (error)
    }
  },
  async REORDER_ACTIONS({ state, dispatch, commit, rootState }, { parentOutboxId, box }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!

    let data = await this.$api.automation.reorderBlock(promoterOid, automationId, box.block.id, parentOutboxId)
    dispatch('SET_CHILD_ACTIONS', data)
    commit('setEditableItem', box.block)
    commit('clearDragOverId')
    commit('clearDraggedBox')
  },
  async DELETE_TRIGGER({ state, commit, rootState }, { id, index }) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!

    try {
      await this.$api.automation.deleteTrigger(promoterOid, automationId, id)
      commit('removeTriggerFromState', index)
      if (state.editableItem?.id === id) {
        commit('clearEditable')
      }
    } catch (error) {
      console.log(error)
    }
  },
  async DELETE_ACTION({ state, dispatch, commit, rootState }, box) {
    let { promoterOid } = rootState.auth.account!
    let automationId = state.id!

    try {
      await this.$api.automation.deleteBlock(promoterOid, automationId, box.block.id)
      let data = await dispatch('FETCH_AUTOMATION_DATA', automationId)
      if (state.editableItem?.id === box.block.id) {
        commit('clearEditable')
      }
      dispatch('SET_CHILD_ACTIONS', data)
    } catch (error) {
      throw error
    }
  },
  async FETCH_AUTOMATION_STATUS_SINGLE({ state, commit, rootState }, payload) {
    let { promoterOid } = rootState.auth.account!
    let automationId
    if (payload) {
      automationId = payload.id
    } else {
      automationId = state.id!
    }

    try {
      let resp = await this.$api.automation.fetchAutomationSimple(promoterOid, automationId)
      if (resp === '') return
      commit('updateChartStatus', resp.status)
      return resp.status
    } catch (error) {
      console.log('Error polling status of single automation:', error)
    }
  },
  async FETCH_AUTOMATION_STATUS_LIST({ state, commit, rootState }) {
    let { promoterOid } = rootState.auth.account!

    try {
      let automations = await this.$api.automation.fetchAutomations(promoterOid)
      let i = automations.length
      while (i--) {
        commit('updateListItemStatus', { id: automations[i].oid, status: automations[i].status })
      }
    } catch (error) {
      console.log('Error polling status of automation list:', error)
    }
  },
  CLEAR_AUTOMATIONS_LIST({ commit }) {
    commit('clearAutomationsList')
  },
  SET_NEW_ACTION_IS_DRAGGING({ commit }, bool) {
    commit('setNewActionIsDragging', bool)
  },
  SET_DRAG_OVER_ID({ commit }, id) {
    commit('setDragOverId', id)
  },
  CLEAR_DRAG_OVER_ID({ commit }) {
    commit('clearDragOverId')
  },
  SET_DRAGGED_BOX({ commit }, box) {
    commit('setDraggedBox', box)
    commit('clearEditable')
  },
  // TODO: remove
  SET_DRAGGED_BLOCK({ state, commit }, id) {
    let block = getActionBlock(state.actions, id)
    commit('setDraggedBlock', block)
    commit('clearEditable')
  },
  CLEAR_DRAGGED_BOX({ commit }) {
    commit('clearDraggedBox')
  },
  CLEAR_DRAGGED_BLOCK({ commit }) {
    commit('clearDraggedBlock')
  },
  SET_SIDEBAR_TAB({ commit }, tab) {
    commit('setSidebarTab', tab)
  },
  SET_ZOOM({ commit }, val) {
    commit('setZoom', val)
  },
  SET_SCROLL_VALS({ commit }, data) {
    commit('setScrollVals', data)
  },
  SET_IS_SCROLLING({ commit }, val) {
    commit('setIsScrolling', val)
  },
  TOGGLE_FULL_SCREEN({ commit }) {
    commit('toggleFullScreen')
  },
  async FETCH_CAMPAIGN_REGISTRATION({ }, { promoterOid, oid }) {
    let data = await this.$api.campaign.fetchCampaignForAutomation(promoterOid, oid)
    return data
  },

  async SET_AUDIENCE_FILTER_AS_CONDITION({ state, commit, rootState }, { id, filter }) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account
    const automationId = state.id!
    const actionBlockId = state.editableItem!.id
    const name = `automation-ifelse-filter-${promoterOid}-${automationId}-${actionBlockId}-${Date.now()}`

    let filterGroup: any = {
      conditions: [filter],
      logic: []
    }

    let actionBox = getAutomationAction(state.actions, id)

    try {
      let filterGroupResp = await this.$api.automation.createFilterGroup(promoterOid, name, filterGroup, false, false, 2, automationId)
      let config = {
        'filter-group-oid': filterGroupResp.oid,
        frontend: {
          segment: false,
        }
      }
      await this.$api.automation.addIfElseFilter(promoterOid, automationId, id, config)

      commit('updateIfElseContextData', { item: actionBox.block, config, meta: { filter } })
      commit('actionConfigHasUpdated')
    } catch (error) {
      console.log(error)
    }
  },

  async RESET_IF_ELSE_CONFIG({ state, commit, rootState }, id) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account
    const automationId = state.id!

    await this.$api.automation.addIfElseFilter(promoterOid, automationId, id, {})
    let actionBox = getAutomationAction(state.actions, id)
    if (!actionBox) {
      throw new Error(`Unable to find action block with id: ${id}`)
    }
    commit('updateIfElseContextData', { item: actionBox.block, config: null, meta: {} })
    commit('actionConfigHasUpdated')
  },

  async SET_SAVED_SEGMENT_AS_CONDITION({ state, commit, rootState }, { id, segmentId }) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account
    const automationId = state.id!

    let config = {
      'filter-group-oid': segmentId,
      frontend: {
        segment: true,
      }
    }

    await this.$api.automation.addIfElseFilter(promoterOid, automationId, id, config)
    let actionBox = getAutomationAction(state.actions, id)
    if (!actionBox) {
      throw new Error(`Unable to find action block with id: ${id}`)
    }
    commit('updateIfElseContextData', { item: actionBox.block, config, meta: {} })
    commit('actionConfigHasUpdated')
  },
  async UPDATE_FILTER_CONDITION({ state, commit, rootState }, { id, filterId, filter }) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account
    const automationId = state.id!

    let filterGroup: any = {
      conditions: [filter],
      logic: []
    }

    try {
      await this.$api.automation.updateFilterCondition(promoterOid, filterId, filterGroup)
      let actionBox = getAutomationAction(state.actions, id)
      if (!actionBox) {
        throw new Error(`Unable to find action block with id: ${id}`)
      }

      commit('updateIfElseContextData', { item: actionBox.block, config: { ...actionBox.block.config, frontend: { segment: false } }, meta: { filter } })
    } catch (error) {
      console.log("An error occurred when attempting to update a filter condition for Automation: ", error)
    }
  },
  async FETCH_MESSAGE_LISTS({ commit, rootState }) {
    const promoterOid = rootState.auth.account?.promoterOid!
    let messageLists
    try {
      messageLists = await this.$api.automation.getMessageLists(promoterOid)
      commit('messageList/SET_MESSAGE_LISTS', messageLists, { root: true })
    } catch (error) {
      console.error(error)
    }
  },
  async FETCH_CAMPAIGN_LIST({ commit, rootState }) {
    const promoterOid = rootState.auth.account?.promoterOid!
    let campaigns
    if (!!rootState.campaign.campaigns.length) {
      campaigns = rootState.campaign.campaigns
    } else {
      try {
        campaigns = await this.$api.automation.getCampaigns(promoterOid)
        commit('campaign/SET_CAMPAIGNS', campaigns, { root: true })
      } catch (error) {
        console.error(error)
      }
    }
  },
  async FETCH_PRODUCTS({ commit, rootState }) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account

    let data = await this.$api.automation.getProducts(promoterOid)
    commit('setProducts', data)
  },
  SET_TRIGGER_IS_MOVING({ commit }, bool) {
    commit('setTriggerIsMoving', bool)
  },
}
