import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { MessageList } from '@/api/message-lists/types';
import { audienceActions } from './actions';
import { AudienceState, Audience, SelectedAudienceMap, AudienceOptInStats } from './types';
import { getSelectedFans, generateAudienceOptInsStats } from './utils';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export const initialAudienceState = (): AudienceState => ({
  audience: [],
  totalAudienceCount: 0,
  isNoMoreAudience: false,
  isFetchingAudience: false,
  isFetchingAudienceCount: false,
  hasFetchAudienceFailed: false,
  // For Fan Selection
  audienceSelection: {
    useScratchSegment: false,
    partlySelectedAudienceMap: {},
  },
  // For Total Promoter's Audience Count
  promoterAudienceCount: null,
  isFetchingPromoterAudienceCount: false,
  // Optin Stats
  audienceOptInsStats: {
    email: { optIns: 0, totalAvailable: 0 },
    sms: { optIns: 0, totalAvailable: 0 },
  },
  isFetchingAudienceOptInsStats: false,
  // Audience CSV
  isExportingAudienceCsv: false,
  isImportingAudienceCsv: false,
});

const audienceModule: Module<AudienceState, RootState> = {
  namespaced: true,
  state: initialAudienceState,
  actions: audienceActions,
  mutations: {
    // For fetching audience
    RESET_AUDIENCE(state, { skipResetAudienceCount = false } = {}) {
      state.audience = [];
      if (!skipResetAudienceCount) state.totalAudienceCount = 0;
      state.isNoMoreAudience = false;
      state.hasFetchAudienceFailed = false;
      state.isFetchingAudience = false;
      state.isFetchingAudienceCount = false;
    },
    SET_AUDIENCE(state, audience: Audience) {
      state.audience = clone(audience);
    },
    CONCAT_AUDIENCE(state, audience: Audience) {
      state.audience = clone(state.audience.concat(audience));
    },
    SET_AUDIENCE_COUNT(state, totalAudienceCount: number) {
      state.totalAudienceCount = totalAudienceCount;
    },
    SET_IS_NO_MORE_AUDIENCE(state, isNoMoreAudience: boolean) {
      state.isNoMoreAudience = isNoMoreAudience;
    },
    SET_IS_FETCHING_AUDIENCE(state, isFetching: boolean) {
      state.isFetchingAudience = isFetching;
    },
    SET_IS_FETCHING_AUDIENCE_COUNT(state, isFetching: boolean) {
      state.isFetchingAudienceCount = isFetching;
    },
    SET_HAS_FETCH_AUDIENCE_FAILED(state, hasFailed: boolean) {
      state.hasFetchAudienceFailed = hasFailed;
    },
    // For Total Promoter's Audience Count
    SET_PROMOTER_AUDIENCE_COUNT(state, count: number) {
      state.promoterAudienceCount = count;
    },
    SET_IS_FETCHING_PROMOTER_AUDIENCE_COUNT(state, isFetching: boolean) {
      state.isFetchingPromoterAudienceCount = isFetching;
    },
    // Optin Stats
    GENERATE_AUDIENCE_OPT_INS_STATS(state, payload: { messageList: MessageList, audience: Audience }) {
      state.audienceOptInsStats = generateAudienceOptInsStats(payload.audience, payload.messageList);
    },
    SET_AUDIENCE_OPT_INS_STATS(state, optInsStats: AudienceOptInStats) {
      state.audienceOptInsStats = clone(optInsStats);
    },
    RESET_AUDIENCE_OPT_INS_STATS(state) {
      state.audienceOptInsStats = {
        email: { optIns: 0, totalAvailable: 0 },
        sms: { optIns: 0, totalAvailable: 0 },
      };
    },
    SET_IS_FETCHING_AUDIENCE_OPT_INS_STATS(state, isFetching: boolean) {
      state.isFetchingAudienceOptInsStats = isFetching;
    },
    // Mass Fan Selection
    SELECT_ALL_AUDIENCE(state) {
      const newPartlySelectedAudienceMap: SelectedAudienceMap = {};
      state.audience.forEach(({ oid }) => { newPartlySelectedAudienceMap[oid] = true; });
      state.audienceSelection = {
        useScratchSegment: true,
        partlySelectedAudienceMap: newPartlySelectedAudienceMap,
      };
    },
    CLEAR_ALL_SELECTED_AUDIENCE(state) {
      state.audienceSelection = {
        useScratchSegment: false,
        partlySelectedAudienceMap: {},
      };
    },
    /**
     * Renew Fan Selection based on current list of audience.
     */
    RENEW_AUDIENCE_SELECTION(state) {
      let partlySelectedAudience: Audience = [];
      if (state.audienceSelection.useScratchSegment) {
        // If you did select all, the just select all audience
        partlySelectedAudience = clone(state.audience);
      } else {
        // If you didn't select all, then just select ones you chose
        partlySelectedAudience = getSelectedFans(state.audience, state.audienceSelection.partlySelectedAudienceMap);
      }
      const partlySelectedAudienceMap: SelectedAudienceMap = {};
      partlySelectedAudience.forEach(fan => { partlySelectedAudienceMap[fan.oid] = true; });
      const useScratchSegment = state.audience.length > 0 && partlySelectedAudience.length === state.audience.length;

      state.audienceSelection = { useScratchSegment, partlySelectedAudienceMap };
    },
    SELECT_A_FAN_FROM_AUDIENCE(state, fanOid: number) {
      const partlySelectedAudienceMap = clone(state.audienceSelection.partlySelectedAudienceMap);
      partlySelectedAudienceMap[fanOid] = true;
      const partlySelectedAudience = getSelectedFans(state.audience, partlySelectedAudienceMap);
      const useScratchSegment = partlySelectedAudience.length === state.audience.length;

      state.audienceSelection = { useScratchSegment, partlySelectedAudienceMap };
    },
    DESELECT_A_FAN_FROM_AUDIENCE(state, fanOid: number) {
      const partlySelectedAudienceMap = clone(state.audienceSelection.partlySelectedAudienceMap);
      partlySelectedAudienceMap[fanOid] = false;
      const partlySelectedAudience = getSelectedFans(state.audience, partlySelectedAudienceMap);
      const useScratchSegment = partlySelectedAudience.length === state.audience.length;

      state.audienceSelection = { useScratchSegment, partlySelectedAudienceMap };
    },
    // Audience CSV
    SET_IS_EXPORTING_AUDIENCE_CSV(state, isExporting: boolean) {
      state.isExportingAudienceCsv = isExporting;
    },
    SET_IS_IMPORTING_AUDIENCE_CSV(state, isImporting: boolean) {
      state.isImportingAudienceCsv = isImporting;
    },
  },
  getters: {
    partlySelectedAudience(state) {
      /**
       * If scratch segment is applying, that means we're no longer
       * "partly" selecting audience.
       */
      if (state.audienceSelection.useScratchSegment) {
        return [];
      }
      return getSelectedFans(state.audience, state.audienceSelection.partlySelectedAudienceMap);
    },
    totalSelectedAudienceCount(state): number {
      if (state.audienceSelection.useScratchSegment) {
        return state.totalAudienceCount;
      }
      return getSelectedFans(
        state.audience,
        state.audienceSelection.partlySelectedAudienceMap,
      ).length;
    },
    promoterAudienceCountIsLessThanHundred(state): boolean {
      if (state.promoterAudienceCount === null) {
        return false;
      }
      return state.promoterAudienceCount < 100;
    },
  },
};

export default audienceModule;
