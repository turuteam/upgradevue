import { Module } from "vuex";
import dayjs from 'dayjs';
import { RootState } from '@/store/modules/types';
import { EventRSVPFormCampaign, ScratchEventRSVPFormCampaign } from '@/types/resources/eventRSVPFormCampaign';
import { EventRSVPFormState } from './types';
import { eventRSVPFormActions } from './actions';
import {
  initializeScratchEventRSVPForm,
  correctScratchEventRSVPForm,
} from './utils';
import { clone, mergeObjects } from '~/utils/helpers';

export const initialEventRSVPFormState = (): EventRSVPFormState => ({
  // Current EventRSVP Form
  currentEventRSVPForm: null,
  isFetchingEventRSVPForm: false,
  isDeletingEventRSVPForm: false,
  // Create EventRSVP Form
  createdEventRSVPForm: null,
  isCreatingEventRSVPForm: false,
  // Create Scratch EventRSVP Form
  isCreatingScratchEventRSVPForm: false,
  // Patch EventRSVP Form:
  isPatchingEventRSVPForm: false,
  // Scratch EventRSVP Form
  scratchEventRSVPForm: initializeScratchEventRSVPForm(),
});

const eventRSVPFormModule: Module<EventRSVPFormState, RootState> = {
  namespaced: true,
  state: initialEventRSVPFormState,
  actions: eventRSVPFormActions,
  getters: {
    prunedScratchEventRSVPFormForPreview(state) {
      let newEventRSVPForm = clone(state.scratchEventRSVPForm);
      newEventRSVPForm.resourceOids = newEventRSVPForm.resources.map((item: any) => item.oid);
      // delete newEventRSVPForm.eventOid;
      // delete newEventRSVPForm.event;
      // delete newEventRSVPForm.rewards;

      return newEventRSVPForm;
    },
    prunedScratchEventRSVPFormForServer(state) {
      const newEventRSVPForm = clone(state.scratchEventRSVPForm);
      newEventRSVPForm.resourceOids = newEventRSVPForm.resources.map((item: any) => item.oid);

      delete newEventRSVPForm.resources;
      delete newEventRSVPForm.event;
      // delete newEventRSVPForm.type;

      return newEventRSVPForm;
    },
    // isEventRSVPActive(state): boolean {
    //   if (!state.currentEventRSVPForm) return false;
    //   return state.currentEventRSVPForm; // Check startDate and ednDate from "state.currentEventRSVPForm"
    // },
  },
  mutations: {
    // EventRSVP Form
    RESET_CURRENT_EVENT_RSVP_FORM(state) {
      state.currentEventRSVPForm = null;
    },
    SET_CURRENT_EVENT_RSVP_FORM(state, eventRSVPForm: EventRSVPFormCampaign) {
      state.currentEventRSVPForm = clone(eventRSVPForm);
    },
    SET_IS_FETCHING_EVENT_RSVP_FORM(state, isFetching: boolean) {
      state.isFetchingEventRSVPForm = isFetching;
    },
    SET_IS_DELETING_EVENT_RSVP_FORM(state, isDeleting: boolean) {
      state.isDeletingEventRSVPForm = isDeleting;
    },
    // Create EventRSVP Form
    SET_CREATED_EVENT_RSVP_FORM(state, eventRSVPForm: EventRSVPFormCampaign) {
      state.createdEventRSVPForm = clone(eventRSVPForm);
    },
    PUT_SLUR_URL_IN_CREATED_EVENT_RSVP_FORM(state, urlSlug: string) {
      const newCreatedEventRSVPForm: EventRSVPFormCampaign = clone(state.createdEventRSVPForm);
      newCreatedEventRSVPForm.urlSlug = urlSlug;
      state.createdEventRSVPForm = newCreatedEventRSVPForm;
    },
    RESET_CREATED_EVENT_RSVP_FORM(state) {
      state.createdEventRSVPForm = null;
    },
    SET_IS_CREATING_EVENT_RSVP_FORM(state, isCreating: boolean) {
      state.isCreatingEventRSVPForm = isCreating;
    },
    // Create Scratch EventRSVP Form
    SET_IS_CREATING_SCRATCH_EVENT_RSVP_FORM(state, isCreating: boolean) {
      state.isCreatingScratchEventRSVPForm = isCreating;
    },
    // Patching EventRSVP Form
    SET_IS_PATCHING_EVENT_RSVP_FORM(state, isPatching: boolean) {
      state.isPatchingEventRSVPForm = isPatching;
    },
    // Edit EventRSVP Form
    RESET_SCRATCH_EVENT_RSVP_FORM(state) {
      state.scratchEventRSVPForm = correctScratchEventRSVPForm(initializeScratchEventRSVPForm());
    },
    SET_SCRATCH_EVENT_RSVP_FORM(state, scratchEventRSVPForm: ScratchEventRSVPFormCampaign) {
      state.scratchEventRSVPForm = correctScratchEventRSVPForm(scratchEventRSVPForm);
    },
    PUT_SCRATCH_EVENT_RSVP_FORM(state, scratchEventRSVPFormChanges) {
      const newScratchEventRSVPForm = mergeObjects(state.scratchEventRSVPForm, scratchEventRSVPFormChanges);
      state.scratchEventRSVPForm = newScratchEventRSVPForm;
    },
    INJECT_SCRATCH_EVENT_IN_SCRATCH_EVENT_RSVP_FORM(state, scratchEvent) {
      let endDate = null;
      if (scratchEvent.endDate) {
        endDate = scratchEvent.endDate
      } else if (scratchEvent.startDate) {
        endDate = dayjs(scratchEvent.startDate).add(7, 'day').toDate().toISOString();
      }
      const scratchEventRSVPFormChanges = {
        eventOid: scratchEvent.oid,
        startDate: scratchEvent.startDate,
        endDate,
        name: scratchEvent.name,
        settings: {
          platform: state.scratchEventRSVPForm?.settings.platform || null,
        },
        presentation: {
          metaTitle: scratchEvent.name,
          timeZone: scratchEvent.timeZone,
        },
      }
      const newScratchEventRSVPForm = mergeObjects(state.scratchEventRSVPForm, scratchEventRSVPFormChanges);
      state.scratchEventRSVPForm = newScratchEventRSVPForm;
    },
  }
};

export default eventRSVPFormModule;
