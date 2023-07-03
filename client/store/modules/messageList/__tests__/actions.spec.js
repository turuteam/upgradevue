import Vuex from 'vuex'
import axios from 'axios'
import api from '~/plugins/ar-api'
import { createLocalVue } from '@vue/test-utils'
import createStore from '~/store'

import * as utils from '../utils.ts'
import * as utilHelpers from '@/utils/helpers'

let localVue = createLocalVue()
localVue.use(Vuex)

let ctx = {
  $axios: axios,
  isMock: true
}

const createTestStore = () => {
  let store = createStore()
  let factories = api(ctx)
  store['$api'] = factories
  store['$axios'] = {
    isCancel: jest.fn()
  }
  store['$arNotification'] = {
    push: jest.fn()
  }

  return store
}

jest.mock('../utils.ts')

describe("SET_SMS_RECIPIENT_COUNT_ACCURATE", () => {
  beforeEach(() => { jest.clearAllMocks() })

  it("messageListOid should be set correctly - scratchSimpleMessage.meta.messageListOid", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let messageListOid = 4
    storeLocal.state.message.scratchSimpleMessage.meta.messageListOid = messageListOid

    let apiSpy = jest.fn()
    storeLocal.$api.messageLists.fetchSmsMessagePreview = apiSpy
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(apiSpy).toHaveBeenCalledTimes(1)
    expect(apiSpy.mock.calls[0][1]).toBe(messageListOid)
  })
  it("messageListOid should be set correctly - currentSelectedMessage.scratchSimpleMessage.meta.messageListOid", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let messageListOid = 23

    storeLocal.state.message.scratchSimpleMessage = {}

    storeLocal.state.message = {
      currentSelectedMessage: {
        scratchSimpleMessage: {
          meta: { messageListOid }
        }
      }
    }

    let apiSpy = jest.fn()
    storeLocal.$api.messageLists.fetchSmsMessagePreview = apiSpy
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(apiSpy).toHaveBeenCalledTimes(1)
    expect(apiSpy.mock.calls[0][1]).toBe(messageListOid)
  })
  it("messageBody should be set correctly - scratchSimpleMessage.meta.messageBody", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let messageBody = 'sawyer'
    storeLocal.state.message = {
      scratchSimpleMessage: {
        meta: { messageBody }
      }
    }

    let apiSpy = jest.fn()
    storeLocal.$api.messageLists.fetchSmsMessagePreview = apiSpy
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(apiSpy).toHaveBeenCalledTimes(1)
    expect(apiSpy.mock.calls[0][2]).toBe(messageBody)
  })
  it("messageBody should be set correctly - currentSelectedMessage.meta.messageBody", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let messageBody = 'sawyer'
    storeLocal.state.message = {
      currentSelectedMessage: {
        meta: { messageBody }
      }
    }

    let apiSpy = jest.fn()
    storeLocal.$api.messageLists.fetchSmsMessagePreview = apiSpy
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(apiSpy).toHaveBeenCalledTimes(1)
    expect(apiSpy.mock.calls[0][2]).toBe(messageBody)
  })
  it("messageBody should be set correctly - empty string if nothing available", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let apiSpy = jest.fn()
    storeLocal.$api.messageLists.fetchSmsMessagePreview = apiSpy
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(apiSpy).toHaveBeenCalledTimes(1)
    expect(apiSpy.mock.calls[0][2]).toBe('')
  })
  it("commit SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with an argument of 'true'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    storeLocal.$api.messageLists.fetchSmsMessagePreview = jest.fn()
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setIsFetchFiltRecipListCountSpy = jest.fn()
    storeLocal._mutations["messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT"][0] = setIsFetchFiltRecipListCountSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(setIsFetchFiltRecipListCountSpy.mock.calls[0][0]).toBe(true)
  })
  it("commit message/SET_IS_FETCHING_SMS_COST should be called with an argument of 'true'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    storeLocal.$api.messageLists.fetchSmsMessagePreview = jest.fn()
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setIsFetchSMSCostSpy = jest.fn()
    storeLocal._mutations["message/SET_IS_FETCHING_SMS_COST"][0] = setIsFetchSMSCostSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(setIsFetchSMSCostSpy.mock.calls[0][0]).toBe(true)
  })
  it("commit message/SET_SMS_COST_FAILED_TO_FETCH should be called with an argument of 'false'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    storeLocal.$api.messageLists.fetchSmsMessagePreview = jest.fn()
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setSMSCostFailedToFetchSpy = jest.fn()
    storeLocal._mutations["message/SET_SMS_COST_FAILED_TO_FETCH"][0] = setSMSCostFailedToFetchSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(setSMSCostFailedToFetchSpy.mock.calls[0][0]).toBe(false)
  })
  it("commit SET_FILTERED_RECIPIENT_LIST_COUNT should be called with an argument of the data.cost.recipients api response", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce({cost: {recipients: 23}})
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setFiltRecipListCountSpy = jest.fn()
    storeLocal._mutations["messageList/SET_FILTERED_RECIPIENT_LIST_COUNT"][0] = setFiltRecipListCountSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(setFiltRecipListCountSpy.mock.calls[0][0]).toBe(23)
  })
  it("commit message/PUT_SMS_MESSAGE_PREVIEW should be called with an argument of the data api response", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let mockResp = {test: 'brooks', cost: {recipients: 19}}

    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(mockResp)
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let putSMSMsgPreviewSpy = jest.fn()
    storeLocal._mutations["message/PUT_SMS_MESSAGE_PREVIEW"][0] = putSMSMsgPreviewSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(putSMSMsgPreviewSpy.mock.calls[0][0]).toBe(mockResp)
  })
  it("commit SET_IS_FETCHING_SMS_COST should be called with an argument of 'false'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let mockResp = {test: 'brooks', cost: {recipients: 19}}

    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(mockResp)
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setIsFetchSMSCostSpy = jest.fn()
    storeLocal._mutations["message/SET_IS_FETCHING_SMS_COST"][0] = setIsFetchSMSCostSpy

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(setIsFetchSMSCostSpy.mock.calls[1][0]).toBe(false)
  })
  it("it should handle api errors correctly - $arNotification should not be called if $axios.isCancel returns true", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(true)
    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(consoleSpy).toBeCalledWith('mock error')
    expect(arNotificationSpy).toHaveBeenCalledTimes(0)
  })
  it("it should handle api errors correctly - $arNotification be called if $axios.isCancel returns false", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(false)
    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(consoleSpy).toBeCalledWith('mock error')
    expect(arNotificationSpy.mock.calls[0][0].type).toBe('error')
    expect(arNotificationSpy.mock.calls[0][0].message).toBe('Failed to fetch audience count')
  })
  it("it should handle api errors correctly - commit message/SET_IS_FETCHING_SMS_COST should be called with 'false' if $axios.isCancel returns false", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setIsFetchSMSCostSpy = jest.fn()
    storeLocal._mutations["message/SET_IS_FETCHING_SMS_COST"][0] = setIsFetchSMSCostSpy
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(false)
    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(consoleSpy).toBeCalledWith('mock error')
    expect(setIsFetchSMSCostSpy.mock.calls[1][0]).toBe(false)
  })
  it("it should handle api errors correctly - commit message/SET_SMS_COST_FAILED_TO_FETCH should be called with 'true' if $axios.isCancel returns false", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setSMSCostFailedToFetch = jest.fn()
    storeLocal._mutations["message/SET_SMS_COST_FAILED_TO_FETCH"][0] = setSMSCostFailedToFetch
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(false)
    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(consoleSpy).toBeCalledWith('mock error')
    expect(setSMSCostFailedToFetch.mock.calls[1][0]).toBe(true)
  })
  it("it should handle api errors correctly - commit SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with 'false' if $axios.isCancel returns false", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let setIsFetchFiltRecipListCount = jest.fn()
    storeLocal._mutations["messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT"][0] = setIsFetchFiltRecipListCount
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(false)
    jest.spyOn(storeLocal.$api.messageLists, 'fetchSmsMessagePreview').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid: 19, filter: {conditions: [], logic: []}})

    expect(consoleSpy).toBeCalledWith('mock error')
    expect(setIsFetchFiltRecipListCount.mock.calls[1][0]).toBe(false)
  })
})

describe("SET_EMAIL_RECIPIENT_COUNT_ESTIMATE", () => {
  beforeEach(() => { jest.clearAllMocks() })

  it("commit SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY should be called with an argument of 'estimate', commit SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with an argument of 'true'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }

    let commitSpy = jest.spyOn(storeLocal, 'commit')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: {conditions: [], logic: []}})

    expect(commitSpy.mock.calls[0][0]).toBe("messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY")
    expect(commitSpy.mock.calls[0][1]).toBe("estimate")
    expect(commitSpy.mock.calls[1][0]).toBe("messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT")
    expect(commitSpy.mock.calls[1][1]).toBe(true)
  })
  it("if filter.conditions has length > 0, 'and' should be pushed into filter.logic array", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {
      conditions: [{
        data: {
          condition: "contains",
          value: "jjj"
        },
      }],
      logic: []
    }

    let commitSpy = jest.spyOn(storeLocal, 'commit')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(filterObj.logic[0]).toBe('and')
  })
  it("if filter.conditions is an empty array, 'and' should not be pushed into start of filter.logic array", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {
      conditions: [],
      logic: []
    }

    let commitSpy = jest.spyOn(storeLocal, 'commit')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(filterObj.logic[0]).toBe('(')
  })
  it("the correct filter conditions and logic should be pushed into the filter object", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {
      conditions: [],
      logic: []
    }

    let commitSpy = jest.spyOn(storeLocal, 'commit')
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(filterObj.conditions[0].data.condition).toBe('true_to_any')
    expect(filterObj.conditions[0].name).toBe('listSubscriptions')
    expect(filterObj.conditions[0].type).toBe('condition-search-picker')
    expect(filterObj.conditions[1].data).toBe('email')
    expect(filterObj.conditions[1].name).toBe('subscribedTo')
    expect(filterObj.conditions[1].type).toBe('select')
  })
  it("$api.audience.fetchAudienceCount should be called", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {conditions: [], logic: []}
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let apiSpy = jest.spyOn(storeLocal.$api.audience, 'fetchAudienceCount').mockReturnValueOnce(Promise.resolve(true))

    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(apiSpy).toHaveBeenCalledTimes(1)
  })
  it("commit SET_FILTERED_RECIPIENT_LIST_COUNT should be called with the count response and commit SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with 'false'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {conditions: [], logic: []}
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    let setFilteredRecipListCountSpy = jest.fn()
    let setIsFiltRecipListCountSpy = jest.fn()
    storeLocal._mutations["messageList/SET_FILTERED_RECIPIENT_LIST_COUNT"][0] = setFilteredRecipListCountSpy
    storeLocal._mutations["messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT"][0] = setIsFiltRecipListCountSpy
    let apiSpy = jest.spyOn(storeLocal.$api.audience, 'fetchAudienceCount').mockReturnValueOnce(Promise.resolve(21))

    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(setFilteredRecipListCountSpy.mock.calls[0][0]).toBe(21)
    expect(setIsFiltRecipListCountSpy).toBeCalledTimes(2)
    expect(setIsFiltRecipListCountSpy.mock.calls[1][0]).toBe(false)
  })
  it("it should handle api errors correctly - $arNotification should not be called if $axios.isCancel returns true", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {conditions: [], logic: []}

    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(true)
    jest.spyOn(storeLocal.$api.audience, 'fetchAudienceCount').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(arNotificationSpy).toHaveBeenCalledTimes(0)
    expect(consoleSpy).toBeCalledWith('mock error')
  })
  it("it should handle api errors correctly - $arNotification be called if $axios.isCancel returns false and commit SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with 'false'", async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    let filterObj = {conditions: [], logic: []}

    let setIsFiltRecipListCountSpy = jest.fn()
    storeLocal._mutations["messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT"][0] = setIsFiltRecipListCountSpy

    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
    jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(false)
    jest.spyOn(storeLocal.$api.audience, 'fetchAudienceCount').mockReturnValueOnce(Promise.reject('mock error'))

    await storeLocal.dispatch('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', {promoterOid: 4, filter: filterObj})

    expect(arNotificationSpy).toHaveBeenCalledTimes(1)
    expect(arNotificationSpy.mock.calls[0][0].type).toBe('error')
    expect(arNotificationSpy.mock.calls[0][0].message).toBe('Failed to fetch audience count')
    expect(consoleSpy).toBeCalledWith('mock error')
    expect(setIsFiltRecipListCountSpy.mock.calls[1][0]).toBe(false)
  })
})

describe('FETCH_FILTERED_RECIPIENT_LIST_COUNT', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('getMergedFilters should be called', async () => {
    let storeLocal = await createTestStore()
    storeLocal.state.auth.account = { promoterOid: 4 }
    storeLocal.state.messageList.currentMessageList = { oid: 21 }
    storeLocal.state.messageList.advancedMessageListTargeting = {
      condition: 'include',
      subCondition: null,
      type: 'all',
      values: [],
    }

    let spy = jest.spyOn(utils, 'getMergedFilters').mockImplementationOnce()
    let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

    expect(spy).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })

  describe("$api.messageLists.fetchMessageListRecipientCount", () => {
    beforeEach(() => jest.clearAllMocks())

    it("SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with an argument of 'true'", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let commitSpy = jest.spyOn(storeLocal, 'commit')

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'other', skipStatsSnapshot: true})

      expect(commitSpy.mock.calls[1][0]).toBe("messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT")
      expect(commitSpy.mock.calls[1][1]).toBe(true)
    })
    it("$api.messageLists.fetchMessageListRecipientCount should be called", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let commitSpy = jest.spyOn(storeLocal, 'commit')
      let spy = jest.spyOn(storeLocal.$api.messageLists, 'fetchMessageListRecipientCount')

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'other', skipStatsSnapshot: true})

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toBe(4)
      expect(spy.mock.calls[0][1]).toBe(21)
      expect(spy.mock.calls[0][2]).toBeFalsy()
      expect(spy.mock.calls[0][3]).toBe('other')
    })
    it("SET_FILTERED_RECIPIENT_LIST_COUNT should be called with the correct 'count' response", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let commitSpy = jest.spyOn(storeLocal, 'commit')
      let apiSpy = jest.spyOn(storeLocal.$api.messageLists, 'fetchMessageListRecipientCount').mockReturnValueOnce(23)

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'other', skipStatsSnapshot: true})

      expect(commitSpy.mock.calls[2][0]).toBe("messageList/SET_FILTERED_RECIPIENT_LIST_COUNT")
      expect(commitSpy.mock.calls[2][1]).toBe(23)
    })
    it("SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT should be called with an argument of 'false'", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let commitSpy = jest.spyOn(storeLocal, 'commit')
      let apiSpy = jest.spyOn(storeLocal.$api.messageLists, 'fetchMessageListRecipientCount').mockImplementationOnce()

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'other', skipStatsSnapshot: true})

      expect(commitSpy.mock.calls[2][0]).toBe("messageList/SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT")
      expect(commitSpy.mock.calls[2][1]).toBe(false)
    })

    it("should handle api errors correctly", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let arNotificationSpy = jest.spyOn(storeLocal.$arNotification, 'push')
      jest.spyOn(storeLocal.$axios, 'isCancel').mockReturnValueOnce(true)
      jest.spyOn(storeLocal.$api.messageLists, 'fetchMessageListRecipientCount').mockImplementationOnce(() => Promise.reject('mock error'))

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'other', skipStatsSnapshot: true})

      expect(consoleSpy.mock.calls[0][0]).toBe('mock error')
      expect(arNotificationSpy).toHaveBeenCalledTimes(0)
    })
  })

  describe("SET_EMAIL_RECIPIENT_COUNT_ESTIMATE", () => {
    beforeEach(() => { jest.clearAllMocks() })

    describe('should not be called if', () => {
      beforeEach(() => { jest.clearAllMocks() })

      it("channel doesn't equal 'email'", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: 'include',
          subCondition: null,
          type: 'all',
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.spyOn(storeLocal, 'commit')
        let dispatchSpy = jest.spyOn(storeLocal, 'dispatch')

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'sawyer', skipStatsSnapshot: true})

        expect(dispatchSpy.mock.calls.length).toBe(1)
        expect(commitSpy.mock.calls[0][0]).toBe("messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY")
        expect(commitSpy.mock.calls[0][1]).toBe("accurate")
      })
      it("channel does equal 'email' and state.currentMessageList.filterGroupOid exists", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = {
          oid: 21,
          filterGroupOid: 4,
        }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: 'include',
          subCondition: null,
          type: 'all',
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let dispatchSpy = jest.spyOn(storeLocal, 'dispatch')

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email', skipStatsSnapshot: true})

        expect(dispatchSpy.mock.calls.length).toBe(1)
      })
      it("channel does equal 'email' and state.currentMessageList.filterGroupOid exists but state.currentMessageList.statsSnapshot.total is less than 20000", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = {
          oid: 21,
          filterGroupOid: 4,
          statsSnapshot: {
            total: 21,
          }
        }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: 'include',
          subCondition: null,
          type: 'all',
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let dispatchSpy = jest.spyOn(storeLocal, 'dispatch')

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email', skipStatsSnapshot: true})

        expect(dispatchSpy.mock.calls.length).toBe(1)
      })
    })
    it("should be called if channel equals 'email', state.currentMessageList.filterGroupOid does not exist, and state.currentMessageList.statsSnapshot.total is greater than 20000", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = {
        oid: 21,
        statsSnapshot: {
          total: 72119,
        }
      }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let setEmailActionSpy = storeLocal._actions['messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE'][0] = jest.fn(() => Promise.resolve(true))

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let dispatchSpy = jest.spyOn(storeLocal, 'dispatch')
      let getMergedFiltersSpy = jest.spyOn(utils, 'getMergedFilters').mockReturnValueOnce({conditions: [], logic: []})

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email', skipStatsSnapshot: true})

      expect(dispatchSpy.mock.calls[1][0]).toBe('messageList/SET_EMAIL_RECIPIENT_COUNT_ESTIMATE')
      expect(dispatchSpy.mock.calls[1][1].promoterOid).toBe(4)
      expect(setEmailActionSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe("if skipStatsSnapshot is false", () => {
    beforeEach(() => { jest.clearAllMocks() })

    describe('SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY should be called if', () => {
      beforeEach(() => { jest.clearAllMocks() })

      it("skipStatsSnapshot is false && type === 'all' && targetingFilter doesn't exist", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: 'include',
          subCondition: null,
          type: 'all',
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.fn()
        storeLocal.commit = commitSpy

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

        expect(commitSpy).toHaveBeenCalled()
        expect(commitSpy.mock.calls[0][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY')
        expect(commitSpy.mock.calls[0][1]).toBe('accurate')
      })
      it("skipStatsSnapshot is false && !type && !targetingFilter", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: 'include',
          subCondition: null,
          type: null,
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.fn()
        storeLocal.commit = commitSpy

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

        expect(commitSpy).toHaveBeenCalled()
        expect(commitSpy.mock.calls[0][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY')
        expect(commitSpy.mock.calls[0][1]).toBe('accurate')
      })
      it("skipStatsSnapshot is false && !condition && !targetingFilter", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: null,
          subCondition: null,
          type: "other",
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.fn()
        storeLocal.commit = commitSpy

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

        expect(commitSpy).toHaveBeenCalled()
        expect(commitSpy.mock.calls[0][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY')
        expect(commitSpy.mock.calls[0][1]).toBe('accurate')
      })
      it("skipStatsSnapshot is false && !values && !targetingFilter", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: "include",
          subCondition: null,
          type: "other",
          values: null,
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.fn()
        storeLocal.commit = commitSpy

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

        expect(commitSpy).toHaveBeenCalled()
        expect(commitSpy.mock.calls[0][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY')
        expect(commitSpy.mock.calls[0][1]).toBe('accurate')
      })
      it("skipStatsSnapshot is false && !values.length && !targetingFilter", async () => {
        let storeLocal = await createTestStore()
        storeLocal.state.auth.account = { promoterOid: 4 }
        storeLocal.state.messageList.currentMessageList = { oid: 21 }
        storeLocal.state.messageList.advancedMessageListTargeting = {
          condition: "include",
          subCondition: null,
          type: "other",
          values: [],
        }

        let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        let commitSpy = jest.fn()
        storeLocal.commit = commitSpy

        await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

        expect(commitSpy).toHaveBeenCalled()
        expect(commitSpy.mock.calls[0][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY')
        expect(commitSpy.mock.calls[0][1]).toBe('accurate')
      })

      describe('SET_FILTERED_RECIPIENT_LIST_COUNT should', () => {
        beforeEach(() => { jest.clearAllMocks() })

        it("be set to null if channel doesn't exist", async () => {
          let storeLocal = await createTestStore()
          storeLocal.state.auth.account = { promoterOid: 4 }
          storeLocal.state.messageList.currentMessageList = { oid: 21 }
          storeLocal.state.messageList.advancedMessageListTargeting = {
            condition: 'include',
            subCondition: null,
            type: 'all',
            values: [],
          }

          let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
          let commitSpy = jest.fn()
          storeLocal.commit = commitSpy

          await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})

          expect(commitSpy).toHaveBeenCalled()
          expect(commitSpy.mock.calls[1][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT')
          expect(commitSpy.mock.calls[1][1]).toBe(null)
        })
        it("be set to null if state.currentMessageList.statsSnapshot doesn't exist", async () => {
          let storeLocal = await createTestStore()
          storeLocal.state.auth.account = { promoterOid: 4 }
          storeLocal.state.messageList.currentMessageList = { oid: 21 }
          storeLocal.state.messageList.advancedMessageListTargeting = {
            condition: 'include',
            subCondition: null,
            type: 'all',
            values: [],
          }

          let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
          let commitSpy = jest.fn()
          storeLocal.commit = commitSpy

          await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email'})

          expect(commitSpy).toHaveBeenCalled()
          expect(commitSpy.mock.calls[1][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT')
          expect(commitSpy.mock.calls[1][1]).toBe(null)
        })
        it("be set to null if state.currentMessageList.statsSnapshot.total doesn't exist", async () => {
          let storeLocal = await createTestStore()
          storeLocal.state.auth.account = { promoterOid: 4 }
          storeLocal.state.messageList.currentMessageList = { oid: 21, statsSnapshot: {} }
          storeLocal.state.messageList.advancedMessageListTargeting = {
            condition: 'include',
            subCondition: null,
            type: 'all',
            values: [],
          }

          let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
          let commitSpy = jest.fn()
          storeLocal.commit = commitSpy

          await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email'})

          expect(commitSpy).toHaveBeenCalled()
          expect(commitSpy.mock.calls[1][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT')
          expect(commitSpy.mock.calls[1][1]).toBe(null)
        })
        it("not be called if channel && state.currentMessageList.statsSnapshot.total exists", async () => {
          let storeLocal = await createTestStore()
          storeLocal.state.auth.account = { promoterOid: 4 }
          storeLocal.state.messageList.currentMessageList = { oid: 21, statsSnapshot: { total: 19 } }
          storeLocal.state.messageList.advancedMessageListTargeting = {
            condition: 'include',
            subCondition: null,
            type: 'all',
            values: [],
          }

          let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
          let getFilteredRecipientListCountSpy = jest.spyOn(utils, 'getFilteredRecipientListCount').mockReturnValueOnce(21)
          let commitSpy = jest.fn()
          storeLocal.commit = commitSpy

          await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email'})

          expect(commitSpy).toHaveBeenCalled()
          expect(commitSpy.mock.calls[1][0]).toBe('messageList/SET_FILTERED_RECIPIENT_LIST_COUNT')
          expect(commitSpy.mock.calls[1][1]).toBeTruthy()
        })
      })
    })

    it('capitalizeFirstLetter should be called with the channel as an argument', async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21, statsSnapshot: { total: 19 } }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'all',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let spy = jest.spyOn(utilHelpers, 'capitalizeFirstLetter')

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email'})
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0][0]).toBe('email')
    })

    it('getFilteredRecipientListCount should be called', async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21, statsSnapshot: { total: 19 } }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'all',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let spy = jest.spyOn(utils, 'getFilteredRecipientListCount')

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'email'})
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('should return null if', () => {
    beforeEach(() => { jest.clearAllMocks() })
    const store = createTestStore()

    it("rootState.auth.account doesn't exist", async () => {
      let result = await store.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})
      expect(result).toBeNull()
    })

    it("state.currentMessageList doesn't exist", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }

      let result = await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})
      expect(result).toBeNull()
    })

    it("state.currentMessageList.oid doesn't exist", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = {}

      let result = await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {})
      expect(result).toBeNull()
    })
  })

  describe("SET_SMS_RECIPIENT_COUNT_ACCURATE", () => {
    beforeEach(() => { jest.clearAllMocks() })

    it("should be called if channel equals 'sms'", async () => {
      let storeLocal = await createTestStore()
      storeLocal.state.auth.account = { promoterOid: 4 }
      storeLocal.state.messageList.currentMessageList = { oid: 21 }
      storeLocal.state.messageList.advancedMessageListTargeting = {
        condition: 'include',
        subCondition: null,
        type: 'all',
        values: [],
      }

      let consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      let commitSpy = jest.spyOn(storeLocal, 'commit')
      let dispatchSpy = jest.spyOn(storeLocal, 'dispatch')

      await storeLocal.dispatch('messageList/FETCH_FILTERED_RECIPIENT_LIST_COUNT', {channel: 'sms', skipStatsSnapshot: true})

      expect(dispatchSpy.mock.calls[1][0]).toBe("messageList/SET_SMS_RECIPIENT_COUNT_ACCURATE")
      expect(dispatchSpy.mock.calls[1][1].promoterOid).toBe(4)
    })
  })
})
