import { Module } from "vuex"
import { RootState } from '@/store/modules/types'
import { AutomationState } from './types'
import { automationActions } from './actions'

export const initialAutomationState = (): AutomationState => ({
  id: null,
  name: null,
  status: null,
  rootBoxId: null,
  createdAt: null,
  triggers: {
    boxId: null,
    items: [],
  },
  actions: [],
  editableItem: null,
  automationsList: null,
  loading: false,
  newActionIsDragging: false,
  dragOverId: null,
  draggedBox: null,
  selectedSidebarTab: 'triggers',
  zoomVal: 1,
  scrollVals: null,
  isScrolling: null,
  isFullScreen: false,
  actionConfigHasUpdated: null,
  triggerIsMoving: false,
  products: null,
})

const automationModule: Module<AutomationState, RootState> = {
  namespaced: true,
  state: initialAutomationState,
  actions: automationActions,
  mutations: {
    addBoxes(state, boxes) {
      state.actions = boxes
    },
    clearEditable(state, selectedTab) {
      state.editableItem = null
      if (selectedTab) {
        state.selectedSidebarTab = selectedTab
      }
    },
    setEditableItem(state, item) {
      state.editableItem = item
    },
    newAutomation(state, payload) {
      let rootBoxId = payload['root-box']['oid']
      state.id = payload.oid,
        state.name = payload.name
      state.status = payload.status
      state.rootBoxId = rootBoxId
      state.createdAt = payload['sys-ctime']
      state.triggers = {
        ...state.triggers,
        boxId: rootBoxId
      }
      state.actions = [
        [
          {
            "type": "action-prompt",
            "parentOutBoxId": rootBoxId,
            "branch": null
          }
        ]
      ]
    },
    renameAutomation(state, name) {
      state.name = name
    },
    updateContextData(_, { item, config, meta }) {
      if (!Object.keys(config).length) {
        item.config = {}
        item.meta = {}
      } else {
        item.config = {
          ...item.config,
          ...config
        }
        item.meta = {
          ...item.meta,
          ...meta
        }
      }
    },
    updateIfElseContextData(_, { item, config, meta }) {
      item.config = config
      item.meta = meta
    },
    setAutomationsList(state, payload) {
      state.automationsList = payload
    },
    removeAutomationFromList(state, id) {
      state.automationsList = state.automationsList.filter((item: any) => {
        return item.oid !== id
      })
    },
    clearAutomation(state) {
      state.id = null
      state.name = null
      state.status = null
      state.rootBoxId = null
      state.createdAt = null
      state.triggers = { boxId: null, items: [] }
      state.actions = []
      state.editableItem = null
      state.dragOverId = null
      state.draggedBox = null
      state.zoomVal = 1
      state.scrollVals = null
      state.isScrolling = null
      state.isFullScreen = false
      state.selectedSidebarTab = 'triggers'
      state.actionConfigHasUpdated = null
      state.triggerIsMoving = false
    },
    setAutomationBasicDetails(state, { chart, rootBoxId }) {
      state.id = chart.oid
      state.name = chart.name
      state.status = chart.status
      state.rootBoxId = rootBoxId
      state.createdAt = chart['sys-ctime']
      state.triggers = {
        ...state.triggers,
        boxId: rootBoxId
      }
    },
    setActionsFromAPI(state, actions) {
      state.actions = actions
    },
    addTrigger(state, trigger) {
      state.triggers = {
        ...state.triggers,
        items: [
          ...state.triggers.items,
          trigger
        ]
      }
    },
    reorderActions(state, actions) {
      state.actions = actions
    },
    setLoading(state, bool) {
      state.loading = bool
    },
    updateStatus(state, status) {
      state.status = status
    },
    updateChartStatus(state, status) {
      state.status = status
    },
    updateListItemStatus(state, { id, status }) {
      let auto = state.automationsList.find((item: any) => item.oid === id && item.status !== status)
      if (!auto) return
      auto.status = status
    },
    clearAutomationsList(state) {
      state.automationsList = null
      state.status = null
    },
    setNewActionIsDragging(state, bool) {
      state.newActionIsDragging = bool
    },
    setDragOverId(state, id) {
      state.dragOverId = id
    },
    clearDragOverId(state) {
      state.dragOverId = null
    },
    setDraggedBox(state, box) {
      state.draggedBox = box
    },
    clearDraggedBox(state) {
      state.draggedBox = null
    },
    setSidebarTab(state, tab) {
      state.selectedSidebarTab = tab
    },
    setZoom(state, val) {
      state.zoomVal = val
    },
    setScrollVals(state, vals) {
      state.scrollVals = vals
    },
    setIsScrolling(state, val) {
      state.isScrolling = val
    },
    toggleFullScreen(state) {
      state.isFullScreen = !state.isFullScreen
    },
    actionConfigHasUpdated(state) {
      // trigger watchers with new object
      // to initiate a redraw of leader-lines
      state.actionConfigHasUpdated = {}
    },
    removeTriggerFromState(state, index) {
      state.triggers.items = [
        ...state.triggers.items.slice(0, index),
        ...state.triggers.items.slice(index + 1),
      ]
    },
    setTriggerIsMoving(state, bool) {
      state.triggerIsMoving = bool
    },
    setProducts(state, data) {
      state.products = data
    }
  },
  getters: {
    getEditableId(state) {
      return state.editableItem?.id
    },
    getAutomationCardStatus: (state) => (id: any) => {
      return state.automationsList.find((item: any) => item.oid === id).status
    },
    hasPendingStates(state) {
      if (!state.automationsList?.length) return false

      let i = state.automationsList.length
      while (i--) {
        if (state.automationsList[i].status.includes('should')) {
          return true
        }
      }
      return false
    },
    isPendingState(state) {
      return !!(state.status && (state.status.includes('should') || state.status.includes('ing')))
    },
    getProducts(state) {
      return state.products
    },
  }
};

export default automationModule
