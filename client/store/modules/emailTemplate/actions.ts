import { ActionTree } from 'vuex';
import crypto from 'crypto';
import { RootState } from '@/store/modules/types';
import { EmailTemplate, EmailTemplateState, ScratchEmailTemplate, UnlayerTemplate } from './types';
import { recursivelyPurifyUnlayerDesign } from '@/store/modules/message/utils';

const BEEFREE_ITEMS_PER_PAGE = 16

export const emailTemplateActions: ActionTree<EmailTemplateState, RootState> = {
  async DOWNLOAD_UNLAYER_HTML({ commit, state }, design: object) {
    const hash = crypto.createHash('md5').update(JSON.stringify(design)).digest('base64');
    // It already exists
    if (state.unlayerHtmlCacheMap[hash]) {
      return;
    }

    const unlayerExportHtml = await this.$api.unlayer.exportHtml(design);

    commit('SET_UNLAYER_HTML_CACHE', {
      hash,
      html: unlayerExportHtml.html,
    })
  },
  async DOWNLOAD_BEEFREE_HTML_FROM_TEMPLATE({ commit, state, rootState }, {
    design, previewHtml, footerHtml
  }) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;

    try {
      const { html } = await this.$api.beefree.generateHtml(promoterOid, design, previewHtml, footerHtml);
      return html
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch HTML for the Beefree template',
      });
      return false;
    }
  },
  async FETCH_UNLAYER_TEMPLATES({ commit, state, dispatch }) {
    if (state.unlayerTemplates.length > 0) {
      return;
    }
    try {
      commit('SET_IS_FETCHING_UNLAYER_TEMPLATES', true);
      const base64Auth = btoa(`${process.env.arUnlayerApiKey}:`);
      // @ts-ignore
      const { data } = await this.$axios.mono.get(
        'https://api.unlayer.com/v1/templates',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${base64Auth}`,
          },
        },
      );
      const unlayerTemplates: UnlayerTemplate[] = data.data;
      const filteredTemplates = unlayerTemplates.filter(template => {
        return template.folder?.name !== 'test';
      });
      for (let i = 0; i < filteredTemplates.length; i += 1) {
        const currentUnlayerTemplate = filteredTemplates[i];
        dispatch('DOWNLOAD_UNLAYER_HTML', currentUnlayerTemplate.design);
      }

      commit('SET_UNLAYER_TEMPLATES', filteredTemplates);
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch templates from Unlayer library',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_UNLAYER_TEMPLATES', false);
    }
  },
  async FETCH_SELECTED_UNLAYER_TEMPLATE({ commit }, id: number) {
    try {
      const base64Auth = btoa(`${process.env.arUnlayerApiKey}:`);
      // @ts-ignore
      const { data } = await this.$axios.mono.get(
        `https://api.unlayer.com/v1/templates/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${base64Auth}`,
          },
        },
      );
      commit('SET_SELECTED_UNLAYER_TEMPLATE', data.data);
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch template from Unlayer library',
      });
      return false;
    }
  },
  // CATALOGUED BEEFREE TEMPLATES 
  async FETCH_BEEFREE_TEMPLATES({ commit, state, rootState, dispatch }, {skip, append}) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;

    try {
      commit('SET_IS_FETCHING_BEEFREE_TEMPLATES', true);
      const { templates, count } = await this.$api.beefree.getCatalogueTemplates(promoterOid, {
        top: BEEFREE_ITEMS_PER_PAGE,
        skip,
      });

      if (state.beefreeTemplates === null || state.beefreeTemplates.length === 0) {
        commit('SET_BEEFREE_TEMPLATES', templates);
      } else if (append) {
        commit('CONCAT_BEEFREE_TEMPLATES', templates);
      }

      if ((state.beefreeTemplates.length)  >= count) {
        commit('SET_NO_MORE_BEEFREE_TEMPLATES', true);
      }

      if (state.totalEmailTemplatesCount != count) {
        commit('SET_TOTAL_BEEFREE_TEMPLATES_COUNT', count);
      }
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch templates from Beefree library',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_BEEFREE_TEMPLATES', false);
    }
  },

  // SAVED BEEFREE TEMPLATE (SINGLE)
  async FETCH_BEEFREE_TEMPLATE(
    { commit, rootState },
    oid: number,
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_FETCHING_SELECTED_EMAIL_TEMPLATE', true);
      const data = await this.$api.beefree.getTemplate(promoterOid, oid);
      commit('SET_SELECTED_EMAIL_TEMPLATE', data);
      return data;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email template',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_SELECTED_EMAIL_TEMPLATE', false);
    }
  },

  async FETCH_SELECTED_BEEFREE_TEMPLATE({ commit, rootState }, templateOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      const data = await this.$api.beefree.getTemplate(promoterOid, templateOid);
      commit('SET_SELECTED_BEEFREE_TEMPLATE', data);
      return data;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch template from Beefree library',
      });
      return false;
    }
  },

  async FETCH_SELECTED_BEEFREE_CATALOGUE_TEMPLATE({ commit, rootState }, templateOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      const data = await this.$api.beefree.getCatalogueTemplate(promoterOid, templateOid);
      commit('SET_SELECTED_BEEFREE_TEMPLATE', data);
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch template from Beefree library',
      });
      return false;
    }
  },
  // SAVED BEEFREE TEMPLATES MADE BY THE PROMOTER
  async FETCH_ALL_BEEFREE_EMAIL_TEMPLATES({ commit, dispatch, rootState, state }, {skip, append}) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;

    try {
      commit('SET_IS_FETCHING_EMAIL_TEMPLATES', true);

      const { templates, count, templateCount } = await this.$api.beefree.getTemplates(promoterOid, {
        top: BEEFREE_ITEMS_PER_PAGE,
        skip,
      });

      if (state.emailTemplates === null || state.emailTemplates.length === 0) {
        commit('SET_EMAIL_TEMPLATES', templates);
      } else if (append) {
        commit('CONCAT_EMAIL_TEMPLATES', templates);
      }

      if ((state.emailTemplates.length)  >= templateCount) {
        commit('SET_NO_MORE_EMAIL_TEMPLATES', true);
      }

      if (state.totalEmailTemplatesCount != templateCount) {
        commit('SET_TOTAL_EMAIL_TEMPLATES_COUNT', templateCount);
      }

      return templates;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email templates',
      });
      commit('SET_HAS_FETCH_EMAIL_TEMPLATES_FAILED', true);
      return false;
    } finally {
      commit('SET_IS_FETCHING_EMAIL_TEMPLATES', false);
    }
  },
  async FETCH_ALL_EMAIL_TEMPLATES({ commit, dispatch, rootState, state }) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;

    commit('RESET_EMAIL_TEMPLATES');
    let filterParam = `asset-type = "promoter-saved-email-template"`;

    try {
      commit('SET_IS_FETCHING_EMAIL_TEMPLATES', true);
      const { data } = await this.$axios.get(`/bucket`, {
        params: {
          $filter: filterParam,
          $skip: state.emailTemplates ? state.emailTemplates.length : 0,
          $top: 'all',
          $count: true,
          $orderby: 'sysCtime desc',
        },
      });

      const emailTemplates: EmailTemplate[] = data.rows;
      const emailTemplatesCount = data.count;

      emailTemplates.forEach( template => {
        if (template?.meta.templateType === 'unlayer')
          recursivelyPurifyUnlayerDesign(null, template.meta.template);
      });

      commit('SET_EMAIL_TEMPLATES', emailTemplates);
      commit('SET_TOTAL_EMAIL_TEMPLATES_COUNT', emailTemplatesCount);
      commit('SET_NO_MORE_EMAIL_TEMPLATES', true);


      // @ts-ignore
      const unlayerDesigns: object[] = emailTemplates
        .filter(item => item.meta.templateType === 'unlayer')
        .map(item => item.meta.template);

      for (let i = 0; i < unlayerDesigns.length; i += 1) {
        dispatch('DOWNLOAD_UNLAYER_HTML', unlayerDesigns[i]);
      }

      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email templates',
      });
      commit('SET_HAS_FETCH_EMAIL_TEMPLATES_FAILED', true);
      return false;
    } finally {
      commit('SET_IS_FETCHING_EMAIL_TEMPLATES', false);
    }
  },
  async FETCH_EMAIL_TEMPLATE(
    { commit, rootState },
    oid: number,
  ) {
    if (!rootState.auth.account) { return null; }
    try {
      commit('SET_IS_FETCHING_SELECTED_EMAIL_TEMPLATE', true);
      const { data } = await this.$axios.get(`/bucket/${oid}`);
      if (data?.meta?.templateType === 'unlayer') {
        recursivelyPurifyUnlayerDesign(null, data.meta.template);
      }
      commit('SET_SELECTED_EMAIL_TEMPLATE', data);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email template',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_SELECTED_EMAIL_TEMPLATE', false);
    }
  },
  async DELETE_EMAIL_TEMPLATE(
    { rootState, commit },
    oid,
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      await this.$axios.delete(`/promoter/${promoterOid}/bucket/${oid}`);
      commit('REMOVE_FROM_EMAIL_TEMPLATES', oid);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully deleted email template',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete email template',
      });
      return false;
    }
  },
  async DELETE_BEEFREE_EMAIL_TEMPLATE(
    { rootState, commit },
    oid,
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      await this.$api.beefree.deleteTemplate(promoterOid, oid);
      commit('REMOVE_FROM_EMAIL_TEMPLATES', oid);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully deleted email template',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete email template',
      });
      return false;
    }
  },
  async UPDATE_EMAIL_TEMPLATE(
    { rootState, commit },{
      scratchEmailTemplate,
      displaySuccessMessage = true,
    }: {
      scratchEmailTemplate: ScratchEmailTemplate,
      displaySuccessMessage: boolean,
    }
  ) {
    if (!rootState.auth.account) { return null; }

    try {
      commit('SET_IS_UPDATING_SELECTED_EMAIL_TEMPLATE', true);

     await this.$axios.patch(`/bucket/${scratchEmailTemplate.oid}`, {
        meta: {
          ...scratchEmailTemplate.meta,
        },
      });
      commit('PATCH_IN_EMAIL_TEMPLATES', {
        oid: scratchEmailTemplate.oid,
        changes: scratchEmailTemplate,
      })
      if (displaySuccessMessage) {
        this.$arNotification.push({
          type: 'success',
          message: 'Successfully updated email template',
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update email template',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_SELECTED_EMAIL_TEMPLATE', false);
    }
  },
  async CREATE_EMAIL_TEMPLATE(
    { rootState, commit, dispatch },
    scratchEmailTemplate: ScratchEmailTemplate,
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_CREATING_EMAIL_TEMPLATE', true);
      const { data } = await this.$axios.post(`/promoter/${promoterOid}/bucket`, {
        assetType: 'promoter-saved-email-template',
        contentType: 'text/html',
        meta: {
          ...scratchEmailTemplate.meta,
        },
      });
      const design = data.meta.template;
      // Don't forget to purify it first
      recursivelyPurifyUnlayerDesign(null, design);
      commit('ADD_TO_EMAIL_TEMPLATES', data);
      dispatch('DOWNLOAD_UNLAYER_HTML', design);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create email template',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_EMAIL_TEMPLATE', false);
    }
  },
  async CREATE_BEEFREE_EMAIL_TEMPLATE(
    { rootState, commit, dispatch },
    scratchEmailTemplate: ScratchEmailTemplate,
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_CREATING_EMAIL_TEMPLATE', true);
      const data = await this.$api.beefree.addNewTemplate(
        promoterOid,
        scratchEmailTemplate,
      )
      commit('ADD_TO_EMAIL_TEMPLATES', data);
      // dispatch('DOWNLOAD_UNLAYER_HTML', design);
      return data;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create email template',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_EMAIL_TEMPLATE', false);
    }
  },
  async UPDATE_BEEFREE_EMAIL_TEMPLATE(
    { rootState, commit },{
      scratchEmailTemplate,
      displaySuccessMessage = true,
    }: {
      scratchEmailTemplate: ScratchEmailTemplate,
      displaySuccessMessage: boolean,
    }
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_UPDATING_SELECTED_EMAIL_TEMPLATE', true);
      const data = await this.$api.beefree.updateTemplate(
        promoterOid,
        scratchEmailTemplate.oid,
        scratchEmailTemplate.meta,
        null,
        null,
        null,
      )

      commit('PATCH_IN_EMAIL_TEMPLATES', {
        oid: scratchEmailTemplate.oid,
        changes: scratchEmailTemplate,
      })
      if (displaySuccessMessage) {
        this.$arNotification.push({
          type: 'success',
          message: 'Successfully updated email template',
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update email template',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_SELECTED_EMAIL_TEMPLATE', false);
    }
  },
};
