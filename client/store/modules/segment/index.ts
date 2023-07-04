import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers';
import { isSegmentConditionComplete } from '@/utils/segment';
import { segmentActions } from './actions';
import {
  SegmentState,
  ConditionSearchPickerChosenItemsMap,
} from './types';
import {
  generateSegmentConditionHashMap,
  generateSegmentConditionExpression,
  addSegmentConditionHash,
  removeSegmentConditionHash,
  getPrunedSegment,
  getPrunedSegmentFilter,
  generateScratchSegmentFromTag,
  generateScratchSegmentFromMessageSegment,
} from './utils';
import { useNuxtApp } from "nuxt/app";

const nuxtApp = useNuxtApp()

export const initialSegmentState = (): SegmentState => ({
  segmentCriteriaGroups: [],
  segmentCriteriaMap: {},
  savedSegmentList: [],
  internalSegment: null,
  scratchSegment: null,
  scratchSegmentInfo: { source: null, sourceOid: null, changed: false },
  scratchSegmentConditionHashMap: {},
  segmentChosenItemsMap: {
    campaigns: {},
    events: {},
    pages: {},
    tags: {},
  },
  isPatchingSegment: false,
  isCreatingSegment: false,
  isDeletingSegment: false
});

const segmentModule: Module<SegmentState, RootState> = {
  namespaced: true,
  state: initialSegmentState,
  actions: segmentActions,
  getters: {
    isSegmentConditionComplete(): Function {
      return (segmentCondition: SegmentCondition): boolean => {
        return isSegmentConditionComplete(segmentCondition);
      };
    },
    getSegmentConditionExpression(state): Function {
      return (segmentCondition: SegmentCondition): string => {
        return generateSegmentConditionExpression(segmentCondition, state.segmentCriteriaMap[segmentCondition.name], state.segmentChosenItemsMap);
      };
    },
    activeSavedSegment(state): Segment | null {
      if (state.scratchSegmentInfo.source !== 'saved-audience-filter') { return null; }
      return state.savedSegmentList.find(filter => filter.oid === state.scratchSegmentInfo.sourceOid) || null;
    },
    bubbleUpFavoriteSegments() {
      return (filters: Segment[]) => clone(filters).sort(
        (a: Segment, b: Segment) => {
          if (a.favourite && !b.favourite) return -1;
          else if (!a.favourite && b.favourite) return 1;
          else return 0;
        },
      );
    },
    /**
     * A pruned applied filter that is wihout any incomplete condition
     * @param state
     */
    prunedScratchSegment(state) {
      if (!state.scratchSegment) { return null; }
      return getPrunedSegment(state.scratchSegment);
    },
    scratchSegmentHasCompleteConditions(state) {
      if (!state.scratchSegment) { return false; }
      return getPrunedSegment(state.scratchSegment).filter.conditions.length > 0;
    },

    prunedScratchSegmentFilter(state) {
      if (!state.scratchSegment) { return null; }
      return getPrunedSegmentFilter(state.scratchSegment);
    },
    audienceFilterCriteria(state) {
      return state.segmentCriteriaGroups.find(item => item.title === 'AUDIENCE')!.data
    }
  },
  mutations: {
    SET_SEGMENT_CRITERIA(state, segmentCriteriaGroups: SegmentCriteriaGroup[]) {
      state.segmentCriteriaGroups = segmentCriteriaGroups;
      const map: SegmentCriteriaMap = {};
      for (let i = 0; i < segmentCriteriaGroups.length; i += 1) {
        const criteria = segmentCriteriaGroups[i].data;
        for (let j = 0; j < criteria.length; j += 1) {
          map[criteria[j].resource] = criteria[j];
        }
      }
      state.segmentCriteriaMap = map;
    },
    SET_SAVED_SEGMENT_LIST(state, filterList: Segment[]) {
      state.savedSegmentList = clone(filterList);
    },
    PATCH_SEGMENT_IN_SAVED_SEGMENT_LIST(state, { oid, editFilter }: { oid: number, editFilter: Segment }) {
      let clonedSegmentList: Segment[] = clone(state.savedSegmentList);
      clonedSegmentList = clonedSegmentList.map(filter => {
        return filter.oid === oid ? mergeObjects(filter, editFilter) : filter;
      });

      state.savedSegmentList = clonedSegmentList;
    },
    ADD_TO_SAVED_SEGMENT_LIST(state, filter: Segment) {
      const newFilter: Segment = clone(filter);
      const clonedSegmentList: Segment[] = clone(state.savedSegmentList);
      clonedSegmentList.unshift(newFilter);
      state.savedSegmentList = clonedSegmentList;
    },
    DELETE_FROM_SAVED_SEGMENT_LIST(state, deleteFilterOid: number) {
      const newSavedFilterList: Segment[] = clone(state.savedSegmentList.filter(({ oid }) => oid !== deleteFilterOid));
      state.savedSegmentList = newSavedFilterList;
    },
    SET_INTERNAL_SEGMENT(state, filter: Segment) {
      state.internalSegment = clone(filter);
    },
    SET_SCRATCH_SEGMENT(state, filter: Segment) {
      state.scratchSegment = clone(filter);
    },
    PATCH_SCRATCH_SEGMENT(state, editFilter: Segment) {
      if (!state.scratchSegment) return;
      state.scratchSegment = mergeObjects(state.scratchSegment, editFilter);
    },
    SET_SCRATCH_SEGMENT_BY_SAVED_SEGMENT(state, filterOid: number) {
      const selectedSavedFilter: Segment | null = state.savedSegmentList.find(filter => filter.oid === filterOid) || null;
      if (!selectedSavedFilter || !state.scratchSegment) return;

      state.scratchSegmentInfo = {
        source: 'saved-audience-filter',
        changed: false,
        sourceOid: filterOid,
      };

      const newScratchSegment = clone({
        ...selectedSavedFilter,
        oid: state.scratchSegment.oid,
      });
      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = generateSegmentConditionHashMap(newScratchSegment);
    },
    SET_SCRATCH_SEGMENT_BY_AUDIENCE_TAG(state, tagOid: number) {
      if (!state.scratchSegment) return;

      state.scratchSegmentInfo = {
        source: 'tag',
        changed: true,
        sourceOid: tagOid,
      };

      const newScratchSegment = generateScratchSegmentFromTag(tagOid, state.scratchSegment);
      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = generateSegmentConditionHashMap(newScratchSegment);
    },
    SET_SCRATCH_SEGMENT_BY_MESSAGE_SEGMENT(state, { messageSegmentOid, filter }: {messageSegmentOid: number, filter: any}) {
      state.scratchSegmentInfo = {
        source: 'message-segment',
        changed: !!filter && filter.conditions && filter.conditions.length > 0,
        sourceOid: messageSegmentOid,
      };

      const newScratchSegment = generateScratchSegmentFromMessageSegment(messageSegmentOid, filter);
      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = generateSegmentConditionHashMap(newScratchSegment);
    },
    RESET_SCRATCH_SEGMENT(state) {
      if (!state.internalSegment || !state.scratchSegment) return;

      state.scratchSegmentInfo = {
        source: 'internal-audience-filter',
        changed: false,
        sourceOid: state.internalSegment.oid,
      };

      const newScratchSegment = clone({
        ...state.internalSegment,
        name: '',
        oid: state.scratchSegment.oid,
      });
      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = generateSegmentConditionHashMap(newScratchSegment);
    },
    RESET_SCRATCH_SEGMENT_FROM_MESSAGE_SEGMENT(state) {
      if (!state.internalSegment || !state.scratchSegment) return;

      state.scratchSegmentInfo = {
        source: 'message-segment',
        changed: false,
        sourceOid: state.scratchSegmentInfo.sourceOid,
      };

      const newScratchSegment = clone({
        ...state.internalSegment,
        name: '',
        oid: state.scratchSegment.oid,
      });
      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = generateSegmentConditionHashMap(newScratchSegment);
    },
    SET_SCRATCH_SEGMENT_CONDITION(state, payload: { conditionIndex: number, filterCondition: SegmentCondition }) {
      if (!state.scratchSegment) return;

      const newScratchSegment: Segment = clone(state.scratchSegment);
      newScratchSegment.filter.conditions[payload.conditionIndex] = clone(payload.filterCondition);
      state.scratchSegment = newScratchSegment;

      state.scratchSegmentInfo = { ...state.scratchSegmentInfo, changed: true };
    },
    ADD_SCRATCH_SEGMENT_CONDITION(state, { segmentCriteriaResource, logic }) {
      if (!state.scratchSegment) return;
      if (!state.segmentCriteriaMap[segmentCriteriaResource]) return;

      const segmentCriteria: SegmentCriteria = state.segmentCriteriaMap[segmentCriteriaResource];

      const newScratchSegment: Segment = clone(state.scratchSegment);

      const firstLogic = newScratchSegment.filter.logic[0];

      if (newScratchSegment.filter.conditions.length !== 0) {
        // Check if existing logic in scratch segment is unparenthesized and add parenthesis to it.
        if (logic && firstLogic && (String(firstLogic) != '(' || (String(firstLogic) === "or" && logic != 'or'))) {
          newScratchSegment.filter.logic = ['(', ...newScratchSegment.filter.logic, ')']
        }

        if (logic && logic.length > 0) {
          newScratchSegment.filter.logic = newScratchSegment.filter.logic.concat(logic);
        } else {
          newScratchSegment.filter.logic[newScratchSegment.filter.logic.length] = firstLogic || 'and';
        }
      }

      const newCondition: SegmentCondition = nuxtApp.$arUtils.segment.generateSegmentCondition(segmentCriteria, state.scratchSegmentInfo.source);
      
      newScratchSegment.filter.conditions[newScratchSegment.filter.conditions.length] = newCondition;

      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = addSegmentConditionHash(state.scratchSegmentConditionHashMap);

      state.scratchSegmentInfo = { ...state.scratchSegmentInfo, changed: true };
    },
    DELETE_SCRATCH_SEGMENT_CONDITION(state, conditionIndex: number) {
      if (!state.scratchSegment) return;

      const newScratchSegment: Segment = clone(state.scratchSegment);

      newScratchSegment.filter.conditions.splice(conditionIndex, 1);

      if (conditionIndex < newScratchSegment.filter.logic.length) {
        newScratchSegment.filter.logic.splice(conditionIndex, 1);
      } else {
        newScratchSegment.filter.logic.splice(newScratchSegment.filter.logic.length - 1, 1);
      }

      state.scratchSegment = newScratchSegment;
      state.scratchSegmentConditionHashMap = removeSegmentConditionHash(state.scratchSegmentConditionHashMap, conditionIndex);

      state.scratchSegmentInfo = { ...state.scratchSegmentInfo, changed: true };
    },
    TOGGLE_SCRATCH_SEGMENT_LOGIC(state, logicIndex: number) {
      if (!state.scratchSegment) return;

      const newScratchSegment: Segment = clone(state.scratchSegment);

      const newLogic = newScratchSegment.filter.logic[logicIndex] === 'and' ? 'or' : 'and';
      for (let i = 0; i < newScratchSegment.filter.logic.length; i += 1) {
        newScratchSegment.filter.logic[i] = newLogic;
      }
      state.scratchSegment = newScratchSegment;

      state.scratchSegmentInfo = { ...state.scratchSegmentInfo, changed: true };
    },
    ADD_TO_CONDITION_SEARCH_PICKER_CHOSEN_ITEM_MAP(
      state,
      payload: { resource: SegmentConditionSearchPickerCriteriaResource, items: any[] },
    ) {
      const newMap: ConditionSearchPickerChosenItemsMap = clone(state.segmentChosenItemsMap);
      if (payload.resource === 'campaigns') {
        payload.items.forEach(item => { newMap.campaigns[item.oid] = item; });
      } else if (payload.resource === 'events') {
        payload.items.forEach(item => { newMap.events[item.oid] = item; });
      } else if (payload.resource === 'tags') {
        payload.items.forEach(item => { newMap.tags[item.oid] = item; });
      } else if (payload.resource === 'pages') {
        payload.items.forEach(item => { newMap.pages[item.puid] = item; });
      }
      state.segmentChosenItemsMap = newMap;
    },
    SET_IS_PATCHING_SEGMENT(state, isUpdating: boolean) {
      state.isPatchingSegment = isUpdating;
    },
    SET_IS_CREATING_SEGMENT(state, isUpdating: boolean) {
      state.isCreatingSegment = isUpdating;
    },
    SET_IS_DELETING_SEGMENT(state, isUpdating: boolean) {
      state.isDeletingSegment = isUpdating;
    },
  },
};

export default segmentModule;
