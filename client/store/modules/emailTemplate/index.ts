import { Module } from "vuex";
import { clone, mergeObjects } from '@/utils/helpers/';
import { RootState } from '@/store/modules/types';
import { emailTemplateActions } from './actions';
import { UnlayerTemplate, EmailTemplate, EmailTemplateState, ScratchEmailTemplate, ScratchEmailTemplateChanges, BeefreeTemplate, } from './types';
import { initScratchEmailTemplate, generateScratchEmailTemplate, getUnlayerHtml } from './utils';
import { mergeDynamicTags } from '@/utils/message';

export const initialEmailTemplateStates = (): EmailTemplateState => ({
  // Default dynamic tags
  defaultDynamicTags: ['email_address'],
  // Cache Unlayer HTML
  unlayerHtmlCacheMap: {},
  // Unlayer template library
  unlayerTemplates: [],
  selectedUnlayerTemplate: null,
  isFetchingUnlayerTemplates: false,
  // Cache Beefree HTML
  beefreeHtmlCacheMap: {},
  // Beefree template library
  beefreeTemplates: [],
  selectedBeefreeTemplate: null,
  isFetchingBeefreeTemplates: false,
  totalBeefreeTemplatesCount: null,
  hasNoMoreBeefreeTemplates: false,
  // Saved Email Templates
  emailTemplates: [],
  currentTemplatesCount: null,
  totalEmailTemplatesCount: null,
  isFetchingEmailTemplates: false,
  hasFetchEmailTemplatesFailed: false,
  hasNoMoreEmailTemplates: false,

  

  // Create Email Template
  isCreatingEmailTemplate: false,
  // Selected Email Template
  isFetchingSelectedEmailTemplate: false,
  isUpdatingSelectedEmailTemplate: false,
  selectedEmailTemplate: null,
  // Scratch Email Template
  scratchEmailTemplate: initScratchEmailTemplate(),
  scratchEmailTemplateUnsaved: false,
});

const emailTemplateModule: Module<EmailTemplateState, RootState> = {
  namespaced: true,
  state: initialEmailTemplateStates,
  actions: emailTemplateActions,
  mutations: {
    SET_UNLAYER_HTML_CACHE(state, { hash, html }) {
      const newMap = clone(state.unlayerHtmlCacheMap);
      newMap[hash] = html;
      state.unlayerHtmlCacheMap = newMap;
    },
    // Unlayer template library
    SET_UNLAYER_TEMPLATES(state, unlayerTemplates: UnlayerTemplate[]) {
      state.unlayerTemplates = clone(unlayerTemplates);
    },
    RESET_SELECTED_UNLAYER_TEMPLATE(state) {
      state.selectedUnlayerTemplate = initialEmailTemplateStates().selectedUnlayerTemplate;
    },
    SET_SELECTED_UNLAYER_TEMPLATE(state, unlayerTemplate: UnlayerTemplate) {
      state.selectedUnlayerTemplate = clone(unlayerTemplate);
    },
    SET_IS_FETCHING_UNLAYER_TEMPLATES(state, isFetching: boolean) {
      state.isFetchingUnlayerTemplates = isFetching;
    },
    // Beefree template library
    SET_BEEFREE_TEMPLATES(state, beefreeTemplates: UnlayerTemplate[]) {
      state.beefreeTemplates = clone(beefreeTemplates);
    },
    SET_SELECTED_BEEFREE_TEMPLATE(state, beefreeTemplate: BeefreeTemplate) {
      state.selectedBeefreeTemplate = clone(beefreeTemplate);
    },
    SET_IS_FETCHING_BEEFREE_TEMPLATES(state, isFetching: boolean) {
      state.isFetchingBeefreeTemplates = isFetching;
    },
    SET_TOTAL_BEEFREE_TEMPLATES_COUNT(state, count: number) {
      state.totalBeefreeTemplatesCount = count;
    },
    SET_NO_MORE_BEEFREE_TEMPLATES(state, noMoreData: boolean) {
      state.hasNoMoreBeefreeTemplates = noMoreData;
    },
    CONCAT_BEEFREE_TEMPLATES(state, beefreeTemplates: BeefreeTemplate[]) {
      state.beefreeTemplates = clone(state.beefreeTemplates.concat(beefreeTemplates));
    },
    // Email Templates
    RESET_EMAIL_TEMPLATES(state) {
      const {
        emailTemplates,
        currentTemplatesCount,
        totalEmailTemplatesCount,
        isFetchingEmailTemplates,
        hasFetchEmailTemplatesFailed,
        hasNoMoreEmailTemplates,
        totalBeefreeTemplatesCount,
        hasNoMoreBeefreeTemplates,
        beefreeTemplates
      } = initialEmailTemplateStates();
      state.emailTemplates = emailTemplates;
      state.beefreeTemplates = beefreeTemplates;
      state.totalEmailTemplatesCount = totalEmailTemplatesCount;
      state.currentTemplatesCount = currentTemplatesCount;
      state.isFetchingEmailTemplates = isFetchingEmailTemplates;
      state.hasFetchEmailTemplatesFailed = hasFetchEmailTemplatesFailed;
      state.hasNoMoreEmailTemplates = hasNoMoreEmailTemplates;
      state.totalBeefreeTemplatesCount = totalBeefreeTemplatesCount;
      state.hasNoMoreBeefreeTemplates = hasNoMoreBeefreeTemplates;
    },
    SET_EMAIL_TEMPLATES(state, emailTemplates: EmailTemplate[]) {
      state.emailTemplates = clone(emailTemplates);
    },
    CONCAT_EMAIL_TEMPLATES(state, emailTemplates: EmailTemplate[]) {
      state.emailTemplates = clone(state.emailTemplates.concat(emailTemplates));
    },
    ADD_TO_EMAIL_TEMPLATES(state, emailTemplate: EmailTemplate) {
      state.emailTemplates = clone([emailTemplate, ...state.emailTemplates]);
    },
    PATCH_IN_EMAIL_TEMPLATES(state, {
      oid,
      changes
    }: { oid: number, changes: ScratchEmailTemplateChanges }) {
      state.emailTemplates = state.emailTemplates.map(item => {
        if (item.oid !== oid) {
          return item;
        }
        return mergeObjects(item, changes);
      });
    },
    REMOVE_FROM_EMAIL_TEMPLATES(state, oid: number) {
      state.emailTemplates = state.emailTemplates.filter(item => {
        return item.oid !== oid;
      });
    },
    SET_IS_FETCHING_EMAIL_TEMPLATES(state, isFetching: boolean) {
      state.isFetchingEmailTemplates = isFetching;
    },
    SET_CURRENT_TEMPLATES_COUNT(state, count: number) {
      state.currentTemplatesCount = count;
    },
    SET_TOTAL_EMAIL_TEMPLATES_COUNT(state, count: number) {
      state.totalEmailTemplatesCount = count;
    },
    SET_HAS_FETCH_EMAIL_TEMPLATES_FAILED(state, hasFailed: boolean) {
      state.hasFetchEmailTemplatesFailed = hasFailed;
    },
    SET_NO_MORE_EMAIL_TEMPLATES(state, noMoreData: boolean) {
      state.hasNoMoreEmailTemplates = noMoreData;
    },
    // Create Email Template
    SET_IS_CREATING_EMAIL_TEMPLATE(state, isCreating: boolean) {
      state.isCreatingEmailTemplate = isCreating;
    },
    // Selected Email Template
    SET_IS_FETCHING_SELECTED_EMAIL_TEMPLATE(stete, isFetching: boolean) {
      stete.isFetchingSelectedEmailTemplate = isFetching;
    },
    SET_IS_UPDATING_SELECTED_EMAIL_TEMPLATE(stete, isUpdating: boolean) {
      stete.isUpdatingSelectedEmailTemplate = isUpdating;
    },
    SET_SELECTED_EMAIL_TEMPLATE(state, emailTemplate: EmailTemplate) {
      state.selectedEmailTemplate = clone(emailTemplate);
    },
    // Scratch Email Template
    RESET_SCRATCH_EMAIL_TEMPLATE(state) {
      state.scratchEmailTemplate = initialEmailTemplateStates().scratchEmailTemplate;
    },
    SET_SCRATCH_EMAIL_TEMPLATE(state, emailTemplate: EmailTemplate) {
      state.scratchEmailTemplate = generateScratchEmailTemplate(emailTemplate);
    },
    PATCH_SCRATCH_EMAIL_TEMPLATE(state, changes: ScratchEmailTemplateChanges) {
      const newScratchSimpleMessage: ScratchEmailTemplate = clone(state.scratchEmailTemplate);
      const comingChanges: ScratchEmailTemplateChanges = clone(changes);
      // Replace template, instead of merging, we don't want to mess up with 'Unlayer template'.
      if (newScratchSimpleMessage.meta.template && comingChanges.meta.template) {
        newScratchSimpleMessage.meta.template = comingChanges.meta.template;
        delete comingChanges.meta.template;
      }
      state.scratchEmailTemplate = mergeObjects(newScratchSimpleMessage, changes);
    },
    SET_SCRATCH_EMAIL_TEMPLATE_UNSAVED(state, unsaved: boolean) {
      state.scratchEmailTemplateUnsaved = unsaved;
    },
  },
  getters: {
    availableDynamicTagsInEmailTemplate(state) {
      const availableDynamicTags = mergeDynamicTags(state.defaultDynamicTags);
      return availableDynamicTags;
    },
    getUnlayerHtml(state) {
      return (design: object): string | null => {
        return getUnlayerHtml(state.unlayerHtmlCacheMap, design);
      };
    },
  },
};

export default emailTemplateModule;
