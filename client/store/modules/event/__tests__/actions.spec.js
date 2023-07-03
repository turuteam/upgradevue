import Vuex from 'vuex'
import axios from 'axios'
import api from '~/plugins/ar-api'
import { createLocalVue } from '@vue/test-utils'
import createStore from '~/store'
import {clone} from '~/utils/helpers'
import eventModule from '~/store/modules/event'

let localVue = createLocalVue()
localVue.use(Vuex)

let ctx = {
  $axios: axios,
  isMock: true
}

let store = createStore()
let factories = api(ctx)
store['$api'] = factories

describe('event actions', () => {
  let apiSpy, commitSpy
  beforeEach(() => { jest.clearAllMocks() })

  describe('UPDATE_ANNOTATION', () => {
    beforeEach(() => { jest.clearAllMocks() })

    describe('$api.eventAnnotations.update', () => {
      beforeEach(() => { jest.clearAllMocks() })

      apiSpy = jest.fn()
      commitSpy = jest.fn()
      store.$api.eventAnnotations.update = apiSpy
      store.commit = commitSpy

      it('should be called', async () => {

        store.state.auth.account = { promoterOid: '21' }
        store.state.event.currentEvent = { oid: '19' }

        await store.dispatch('event/UPDATE_ANNOTATION', {name: 'sawyer'})

        expect(apiSpy).toBeCalledTimes(1)
        jest.clearAllMocks()
      })

      it('should be called with correct arguments', async () => {
        apiSpy = jest.fn()
        commitSpy = jest.fn()
        store.$api.eventAnnotations.update = apiSpy
        store.commit = commitSpy

        store.state.auth.account = { promoterOid: '21' }
        store.state.event.currentEvent = { oid: '19' }

        await store.dispatch('event/UPDATE_ANNOTATION', {oid: '4', body: 'sawyer'})
        expect(apiSpy.mock.calls[0][0]).toBe('21')
        expect(apiSpy.mock.calls[0][1]).toBe('19')
        expect(apiSpy.mock.calls[0][2].oid).toBe('4')
        jest.clearAllMocks()
      })
    })

    describe('commit of "UPDATE_ANNOTATION"', () => {
      beforeEach(() => { jest.clearAllMocks() })

      apiSpy = jest.fn()
      commitSpy = jest.fn()
      store.$api.eventAnnotations.update = apiSpy
      store.commit = commitSpy

      it('should be called', async () => {

        store.state.auth.account = { promoterOid: '21' }
        store.state.event.currentEvent = { oid: '19' }

        await store.dispatch('event/UPDATE_ANNOTATION', {oid: '4', body: 'sawyer'})

        expect(commitSpy).toBeCalledTimes(1)
        jest.clearAllMocks()
      })

      it('should be called with correct arguments', async () => {
        apiSpy = jest.fn()
        commitSpy = jest.fn()
        store.$api.eventAnnotations.update = apiSpy
        store.commit = commitSpy

        store.state.auth.account = { promoterOid: '21' }
        store.state.event.currentEvent = { oid: '19' }

        await store.dispatch('event/UPDATE_ANNOTATION', {oid: '4', body: 'sawyer'})

        expect(commitSpy.mock.calls[0][0]).toBe('event/UPDATE_ANNOTATION')
        expect(commitSpy.mock.calls[0][1].oid).toBe('4')
        expect(commitSpy.mock.calls[0][1].body).toBe('sawyer')
        jest.clearAllMocks()
      })
    })

    it('should handle an api error correctly', async () => {
      apiSpy = jest.fn(() => {
        return Promise.reject('mock error')
      })
      commitSpy = jest.fn()
      store.$api.eventAnnotations.update = apiSpy
      store.commit = commitSpy

      store.state.auth.account = { promoterOid: '21' }
      store.state.event.currentEvent = { oid: '19' }

      try {
        await store.dispatch('event/UPDATE_ANNOTATION', {oid: '4', body: 'sawyer'})
      } catch (error) {
        expect(error).toBe('mock error')
      }
      expect(commitSpy).toHaveBeenCalledTimes(0)
    })
  })
})

const getDataDefault = (totalCount, rowsCount = 25) => ( { data: { rows: Array.from({ length: rowsCount }, () => null), count: totalCount }})

describe('Test FETCH_EVENTS_LIST with mutations', () => {
  let store, commitSpy

  beforeEach(() => {
    jest.clearAllMocks()

    store = new Vuex.Store({ modules: { event: clone(eventModule) }})

    store['$axios'] = { get: jest.fn() }
    store['$arNotification'] = { push: jest.fn()}

    store.state.auth = { account: { promoterOid: '123' }}

    commitSpy = jest.fn()
  })

  it('does not fetch events if account is not available', async () => {
    store.commit = commitSpy

    store.state.auth.account = { promoterOid: null }

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(commitSpy).not.toHaveBeenCalled()
  });

  it('does fetch events if promoterOid is available', async () => {
    store.commit = commitSpy

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(commitSpy.mock.calls[0][0]).toBe('event/SET_IS_FETCHING_EVENTS_LIST')
  });

  it('does not fetch events if isFetchingEvents is true', async () => {
    store.commit = commitSpy

    store.state.event.isFetchingEventsList = true;

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(commitSpy).not.toHaveBeenCalled()
  });

  it('does not fetch events if isLastEventLoaded is true', async () => {
    store.commit = commitSpy

    store.state.event.isLastEventListLoaded = true;

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(commitSpy).not.toHaveBeenCalled()
  });

  it('fetches events with default parameters', async () => {
    store.commit = commitSpy

    const expectedUrl = '/promoter/123/event?$select=name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo,provider&$top=25&$skip=0&$count=true&$filter=userDefined&$orderby=oid desc';

    store['$axios'].get.mockResolvedValue(getDataDefault(25));

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(store['$axios'].get).toHaveBeenCalledWith(expectedUrl);
  });

  it('fetches events with custom parameters', async () => {
    store.commit = commitSpy

    store.state.event.eventsListSearch = 'test';
    const expectedUrl = '/promoter/123/event?$select=name,startDate,location&$top=25&$skip=0&$count=true&$filter=userDefined AND (name%20ILIKE%20%22%25test%25%22 OR location%20ILIKE%20%22%25test%25%22)&$orderby=oid desc';

    store['$axios'].get.mockResolvedValue(getDataDefault(25));

    await store.dispatch('event/FETCH_EVENTS_LIST', { selectString: 'name,startDate,location' })

    expect(commitSpy).toHaveBeenCalledTimes(6)
    expect(store['$axios'].get).toHaveBeenCalledWith(expectedUrl);
  });

  it('handles errors correctly', async () => {
    store.commit = commitSpy

    const error = new Error('test error');
    store['$axios'].get.mockResolvedValue(error);

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(commitSpy).toHaveBeenCalledTimes(2)

    expect(store['$axios'].get).toHaveBeenCalled()

    expect(store['$arNotification'].push).toHaveBeenCalledWith({ type: 'error', message: 'There was an error fetching the events' });
  });

  it('if totalCount 25 and stepLoadCount: 25, isLastEventLoaded must be true', async () => {
    store['$axios'] = { get: () => Promise.resolve(getDataDefault(25)) }

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(store.state.event.isLastEventListLoaded).toBe(true)
  })

  it('if totalCount 50 and stepLoadCount: 25, isLastEventLoaded must be false', async () => {
    store['$axios'] = { get: () => Promise.resolve(getDataDefault(50)) }

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(store.state.event.isLastEventListLoaded).toBe(false)
  })

  it('if totalCount 5 and stepLoadCount: 25, isLastEventLoaded must be true', async () => {
    store['$axios'] = { get: () => Promise.resolve(getDataDefault(5, 5)) }

    await store.dispatch('event/FETCH_EVENTS_LIST', {})

    expect(store.state.event.isLastEventListLoaded).toBe(true)
  })
})
