import { ActionTree } from 'vuex'
// @ts-ignore
import * as Papa from 'papaparse';
import { RootState } from '@/store/modules/types';
import { createTextFile } from '@/utils/html-element/';
import { isValidTzDate } from '@/utils/date/';
import {ConversionGraphTimeseries, ConversionStats, MessageState} from './types';
import {
  recursivelyPurifyUnlayerDesign,
  getDyanmicTagsFromContent,
} from '@/store/modules/message/utils';
import { ParseError } from 'libphonenumber-js';
import { clone } from '@/utils/helpers';

export const messageActions: ActionTree<MessageState, RootState> = {
  async FETCH_ADDITIONAL_DYNAMIC_TAGS({ rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;

    try {
      const additionalDynamicTags = await this.$api.messages.fetchAdditionalDynamicTags(promoterOid);
      commit('SET_ADDITIONAL_DYNAMIC_TAGS', additionalDynamicTags);
    } catch (err) {
      console.error(err);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch default dynamic tags.' });
      return false;
    } finally {
      // TODO ?
    }
  },
  async SEND_OUT_MESSAGE({ rootState, state, commit, dispatch }, scratchMessage: ScratchEmailMessage | ScratchSimpleMessage) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;
    const promoterAccountOid = rootState.auth.account.oid;

    const {
      oid,
      customerName,
      meta,
      scheduledAt,
      provider,
    } = scratchMessage;

    const body: any = {
      promoterOid,
      promoterAccountOid,
      status: 'in-progress',
      name: 'fan-message',
      customerName,
      provider,
      meta,
    };

    if (scheduledAt) {
      body.status = 'scheduled';
      body.scheduledAt = scheduledAt;
    }

    if (body.meta && body.meta.uiStatus) {
      delete body.meta.uiStatus;
    }

    if (state.scratchEmailMessage.abEmail) {
      const myList = [];
      for (const key in state.scratchEmailMessageAbList) {
        let x :ScratchEmailMessage["meta"] = clone(meta);
        const value = state.scratchEmailMessageAbList[key];
        x.presentation = clone(value.meta.presentation);
        x.abTest = clone(value.meta.abTest);
        myList.push(x);
      }
      body.meta = myList;
    }
    try {
      commit('SET_IS_SENDING_OUT_MESSAGE', true);

      // Check if message list exist, if not, stop it
      let hasMessageList = true;
      try {
        const res = await this.$axios.get(`/promoter/${promoterOid}/message-list/${meta.messageListOid}`);
        if (!res.data) {
          hasMessageList = false;
        }
      } catch (e) {
        hasMessageList = false;
      }
      if (!hasMessageList) {
        const campaignOid = meta.initiator?.campaignOid;
        dispatch('SHOW_CONFIRM', {
          title: `Could not ${scheduledAt ? 'schedule' : 'send'} message`,
          messageHtml: campaignOid ? 'The selected recipients are unavailable. Please try selecting the recipients again.' : 'Your selected List is not available. Please select another List.',
          hideCancelButton: true,
          confirmButtonText: 'OK',
        }, { root: true });
        return;
      }

      if (oid) {
        await this.$axios.patch(`/promoter/${promoterOid}/task/${oid}`, body);
        dispatch('CONVERSION_SET_EVENTS', oid)
      } else {
        await this.$axios.post(`/promoter/${promoterOid}/task`, body);
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to send message' });
      return false;
    } finally {
      commit('SET_IS_SENDING_OUT_MESSAGE', false);
    }
  },
  async SAVE_MESSAGE_DRAFT({ rootState, state, commit }, {
    provider,
    oid,
    customerName,
    meta,
    scheduledAt,
  }) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;
    const promoterAccountOid = rootState.auth.account.oid;
    if (state.scratchEmailMessage.abEmail) {
      const myList = [];
      for (const key in state.scratchEmailMessageAbList) {
        let x :ScratchEmailMessage["meta"] = clone(meta);
        const value = state.scratchEmailMessageAbList[key];

        if (state.scratchEmailMessage.abEmailType === 'subject') {
          x.presentation = clone(state.scratchEmailMessage.meta.presentation);
          x.abTest = { variant: key, treatment: 'email-subject' };
        }
        else {
          x.presentation = clone(value.meta.presentation);
          x.abTest = { variant: key, treatment: 'email-design' };
        }
        x.messageBody.subject = value.meta.messageBody.subject
        x.messageBody.previewText = value.meta.messageBody.previewText
        myList.push(x);
      }
      meta = myList;
    }

    const jsonBody: any = {
      promoterOid,
      promoterAccountOid,
      provider,
      meta,
      customerName,
      name: 'fan-message',
      status: 'draft',
    };

    if (isValidTzDate(scheduledAt)) {
      jsonBody.scheduledAt = scheduledAt;
      jsonBody.status = 'scheduled'
    } else {
      jsonBody.scheduledAt = null;
    }

    let uri = `/promoter/${promoterOid}/task`;

    try {
      commit('SET_IS_SAVING_MESSAGE_AS_DRAFT', true);
      let response;
      if (oid) {
        response =  await this.$axios.patch(`${uri}/${oid}`, jsonBody);
      } else {
        response = await this.$axios.post(uri, jsonBody);
      }

      if (response.status === 201) {
        this.$arNotification.push({ type: 'success', message: 'Message saved as draft' });
      }

      return response;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to save message as draft' });
      return false;
    } finally {
      commit('SET_IS_SAVING_MESSAGE_AS_DRAFT', false);
    }
  },
  async SEND_TEST_EMAIL({ rootState, commit }, {
    recipients,
    type,
    meta,
    html,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_SENDING_TEST_EMAIL', true);

      const jsonBody = {
        disableLinkTracking: !!meta.disableLinkTracking,
        templateResourceOid: meta.presentation.templateResourceOid,
        messageBody: {
          subject: `[TEST EMAIL] ${meta.messageBody.subject}`,
          previewText: meta.messageBody.previewText,
        },
        email: {
          promoterPropertyOid: meta.email ? meta.email.promoterPropertyOid : null,
        },
        messageListOid: meta.messageListOid,
        type,
        recipients,
        presentation: {
          templateType: meta.presentation.templateType,
          templateHtml: html,
        },
      };

      // @ts-ignore
      await this.$axios.sg.post(`/promoter/${promoterOid}/test-message`, jsonBody);
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to send test message',
      });
      return false;
    } finally {
      commit('SET_IS_SENDING_TEST_EMAIL', false);
    }
  },
  async FETCH_SMS_MESSAGE_PREVIEW(
    { rootState, commit, getters, state },
    { editSmsMessage, cost = false }: { editSmsMessage: ScratchSimpleMessage, cost: boolean },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {

      const advancedTargetingFilter = getters.getCurrentFilterExpression || null;

      if (cost) {
        commit('SET_SMS_COST_FAILED_TO_FETCH', false);
        commit('SET_IS_FETCHING_SMS_COST', true);
      }

      const params: any = {
        $provider: 'sms',
        $body: editSmsMessage.meta.messageBody || '',
        $messageListOid: null,
        $cost: cost || null,
        $audienceFilter: cost ? advancedTargetingFilter : null,
      };
      if (editSmsMessage.meta.messageListOid) {
        params.$messageListOid = editSmsMessage.meta.messageListOid;
      }
      if (editSmsMessage.meta.tagMaxWidthMap && Object.keys(editSmsMessage.meta.tagMaxWidthMap).length > 1) {
        try {
          const encodedString = JSON.stringify(editSmsMessage.meta.tagMaxWidthMap);
          params.$tagMaxWidthMap = encodedString;
        } catch(e) {
          console.log(e);
        }
      }

      // @ts-ignore
      const { data } = await this.$axios.cn.get(`/promoter/${promoterOid}/message-preview/`, {
        params,
      });

      commit('PUT_SMS_MESSAGE_PREVIEW', data);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch SMS message preview' });
      if (cost) {
        commit('SET_SMS_COST_FAILED_TO_FETCH', true);
      }
    } finally {
      if (cost) {
        commit('SET_IS_FETCHING_SMS_COST', false);
      }
    }
  },
  async FETCH_MORE_MESSAGES(
    { state, rootState, commit },
    {
      status = null,
      search = null,
      top = 20,
      select = null,
      reload = false,
    },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    if (state.isFetchingMessages) {
      console.error('FETCH_MORE_MESSAGES cancelled due to existing pending request');
      return;
    }

    // If it's not load more, pls reset messages
    if (reload) {
      commit('RESET_MESSAGES');
    }

    if (state.hasFetchMessagesFailed) {
      console.error(`FETCH_MORE_MESSAGES cancelled due to previous failed request.`);
      return;
    }


    try {
      commit('SET_IS_FETCHING_MESSAGES', true);
      const uri = `/promoter/${promoterOid}/fan-message-search`;
      const params = {
        $top: top,
        $skip: state.messages.length,
        $select: select || null,
        $search: search || null,
        $status: status || null,
      };

      const { data } = await this.$axios.get(uri, { params });

      commit('CONCAT_MESSAGES', data);
      if (data.length === 0) {
        commit('SET_IS_NO_MORE_MESSAGES', true);
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch messages' });
      commit('SET_HAS_FETCH_MESSAGES_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_MESSAGES', false);
    }
  },
  async FETCH_MESSAGE({ rootState, commit }, oid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(oid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message' });
      return null;
    }

    const uri = `/promoter/${promoterOid}/task/${oid}`;

    commit('SET_IS_FETCHING_MESSAGE', true);
    try {
      // @ts-ignore
      const { data } = await this.$axios.sg.get(uri);

      if (data?.meta?.presentation?.templateType === 'unlayer') {
        recursivelyPurifyUnlayerDesign(null, data.meta.presentation.template);
      }
      if (data.meta.length > 1) {
         if (data.meta[0].messageBody.subject){
          data.abEmail = true;
          data.abEmailType = 'subject'
          await commit('CREATE_AB_EMAIL_MESSAGE', data);
          data.meta = data.meta[0];

        } else {
          data.abEmail = true;
          data.abEmailType = 'design'
          await commit('CREATE_AB_EMAIL_MESSAGE', data);
          data.meta = data.meta[0];
        }



      }
      await commit('SET_CURRENT_SELECTED_MESSAGE', data);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message' });
      return false;
    } finally {
      commit('SET_IS_FETCHING_MESSAGE', false);
    }
  },
  async CLONE_MESSAGE({ rootState, commit }, taskOid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/task/${taskOid}/clone`;

    try {
      await this.$axios.post(uri);

      this.$arNotification.push({
        type: 'success',
        message: 'Message successfully duplicated'
      });
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to duplicate message: ${error.message}`,
      });
    }
  },
  async ARCHIVE_MESSAGE({ rootState, commit }, taskOid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/task/${taskOid}`;

    try {
      await this.$axios.patch(uri, {
        status: 'archived',
      });

      this.$arNotification.push({
        type: 'success',
        message: `Successfully archived message`,
      });
      commit('REMOVE_MESSAGE_FROM_MESSAGES', taskOid);
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to archive message: ${error.message}`,
      });
    }
  },
  async CANCEL_MESSAGE({ rootState }, taskOid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/task/${taskOid}`;

    try {
      await this.$axios.patch(uri, {
        status: 'cancelled',
      });
      this.$arNotification.push({
        type: 'success',
        message: `Successfully cancelled message`,
      });
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to cancel message: ${error.message}`,
      });
    }
  },
  // Email Html
  async GENERATE_SCRATCH_EMAIL_TEMPLATE({ rootState, commit }, unlayerDesign: any) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {
      const unlayerExportHtml = await this.$api.unlayer.exportHtml(unlayerDesign);
      commit('SET_SCRATCH_EMAIL_TEMPLATE', unlayerExportHtml?.html);
      return true;
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to generate scratch email template',
      });
      return false;
    }
  },
  async FETCH_SAVED_EMAIL_TEMPLATE({ dispatch, commit }, oid) {
    try {
      commit('SET_IS_FETCHING_SAVED_EMAIL', true);
      const html = await dispatch('GET_ASSET', { oid }, { root: true });
      commit('SET_SAVED_EMAIL', html);
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email template',
      });
    } finally {
      commit('SET_IS_FETCHING_SAVED_EMAIL', false);
    }
  },

  async FETCH_SAVED_BEEFREE_EMAIL_TEMPLATE({ dispatch, commit }, templateHtml) {
    try {
      commit('SET_IS_FETCHING_SAVED_EMAIL', true);
      const html = await this.$api.beefree.exportHtml(templateHtml)
      commit('SET_SAVED_EMAIL', html);
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email template',
      });
    } finally {
      commit('SET_IS_FETCHING_SAVED_EMAIL', false);
    }
  },
  async SWITCH_AB_EMAIL({ dispatch, commit, state, rootState}, data){
    try {
      commit('SWITCH_AB_EMAIL_STATE', data);
    } catch(error){
      this.$arNotification.push({
        type: 'error',
        message:'Failed to switch templates'
      })
    }

  },
  async UPDATE_EMAIL_TEMPLATE_IN_SCRATCH_EMAIL_MESSAGE({ dispatch, commit, state, rootState }, { emailHtml, previewHtml, footerHtml }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    // If you have a saved template, we have to delete it, since we will no longer need it
    // if (state.scratchEmailMessage.meta.templateResourceOid) {
      // Messi 20210303: DO NOT DO THIS AT THE MOMENT! this would probably delete asset from other bucket.
      // dispatch('DELETE_ASSET', state.scratchEmailMessage.meta.templateResourceOid, { root: true });
    // }

    try {
      if (!emailHtml || emailHtml === "undefined") {
        throw "template emailHtml undefined"
      }



      // we need to create a new HTML asset at every save/send
      // because of how our S3 buckets work - we can only
      // PUT to the bucket resource for a limited period.
      const file = createTextFile({
        text: emailHtml,
        type: 'text/html',
        name: 'email_html', // Name doesn't matter here
      });

      if (!file) {
        throw "template blob file undefined"
      }

      commit('SET_IS_UPDATING_EMAIL', true);
      let resource = null

      if (state.scratchEmailMessage.meta?.presentation?.templateType === 'beefree') {
        // Beefree pushes the template to the /bucket-email-template
        resource = await this.$api.beefree.addNewTemplate(
          promoterOid,
          {
            meta: {
              name: state.scratchEmailMessage.name,
              template: state.scratchEmailMessage.meta.presentation.template,
              version: 1,
              previewHtml,
              footerHtml,
            },
            taskOid: !!state.scratchEmailMessage.oid ? state.scratchEmailMessage.oid : null,
          },
        )
      } else {
        // Unlayer pushes the template to the bucket
        const file = createTextFile({
          text: emailHtml,
          type: 'text/html',
          name: 'email_html', // Name doesn't matter here
        });

        resource = await dispatch('UPLOAD_ASSET', {
          assetType: 'email-template',
          contentType: 'text/html',
          file,
        }, { root: true });
      }

      if (!!resource) {
        commit('PATCH_SCRATCH_EMAIL_MESSAGE', {
          meta: {
            templateResourceOid: resource.oid,
          },
        });
      }
      return resource;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update email template',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_EMAIL', false);
    }
  },
  async FETCH_CSV_PREVIEW_CONTACTS({ commit, rootState }, dynamicTagsCsvOid: number) {
    if (!rootState.auth.account) { return null; }
    const promoterOid = rootState.auth.account.promoterOid;
    try {
      const preSignedUrl = await this.$api.buckets.generatePreSignedUrl(promoterOid, dynamicTagsCsvOid, 'get');

      const csvString = await this.$api.csv.stream(preSignedUrl, 25);
      let csvData = Papa.parse<string[]>(csvString, {header: false}).data;

      const headers: string[] = csvData[0];
      const rows: string[][] = csvData.splice(1).filter((row: any[]) => {
        if (row.length === 0) {
          return false;
        }
        return true;
      });

      commit('SET_CSV_PREVIEW_CONTACTS', { headers, rows });
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch dynamic tags csv',
      });
    }
  },
  async RENEW_AVAILABLE_FALLBACK_DYNAMIC_TAGS_FOR_EMAIL_MESSAGE({ commit, state }, message: string) {
    let tagsFromBody = getDyanmicTagsFromContent(message);
    let tagsFromSubject = getDyanmicTagsFromContent(state.scratchEmailMessage.meta?.messageBody?.subject ?? "");
    const dynamicTags: any[] = Array.from(new Set([...tagsFromBody, ...tagsFromSubject]));
    const dynamicTagsWithoutEmailAddress = dynamicTags.filter(tag => tag !== 'email_address');
    commit('SET_FALLBACK_DYNAMIC_TAGS_FOR_SCRATCH_EMAIL_MESSAGE', dynamicTagsWithoutEmailAddress)
    commit('TIDY_UP_FALLBACK_DYNAMIC_TAGS_IN_EMAIL_MESSAGE', dynamicTagsWithoutEmailAddress);
  },
  async RENEW_AVAILABLE_FALLBACK_DYNAMIC_TAGS_FOR_SIMPLE_MESSAGE({ commit }, message: string) {
    const dynamicTags = getDyanmicTagsFromContent(message);
    const dynamicTagsWithoutMobileNumber = dynamicTags.filter(tag => tag !== 'mobile_number');
    commit('SET_FALLBACK_DYNAMIC_TAGS_FOR_SCRATCH_SIMPLE_MESSAGE', dynamicTagsWithoutMobileNumber)
    commit('TIDY_UP_FALLBACK_DYNAMIC_TAGS_IN_SIMPLE_MESSAGE', dynamicTagsWithoutMobileNumber);
  },
  async FETCH_MESSAGE_ACTION_STATS_TIMESERIES({ commit, rootState }, oid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    if (isNaN(oid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message action stats timeseries' });
      return null;
    }


    commit('SET_IS_FETCHING_MESSAGE_ACTION_STATS_TIMESERIES', true);
    try {
      const uri = `/promoter/${promoterOid}/fan-message-action-stats-time-series`;
      // @ts-ignore
      const { data } = await this.$axios.get(uri, {
        params: {
          $filter: `task-oid=${oid}`,
        },
      });

      await commit('SET_MESSAGE_ACTION_STATS_TIMESERIES', data[0]);
      return true;

    } catch (error) {

      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message action stats timeseries' });
      return false;

    } finally {
      commit('SET_IS_FETCHING_MESSAGE_ACTION_STATS_TIMESERIES', false);
    }
  },
  async FETCH_MESSAGE_DELIVERY_STATS({ commit, rootState }, oid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    if (isNaN(oid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message delivery stats' });
      return null;
    }

    const uri = `/promoter/${promoterOid}/message-delivery-stats`;

    commit('SET_IS_FETCHING_MESSAGE_DELIVERY_STATS', true);
    try {
      const params = {
        $filter: `promoterOid = ${promoterOid} AND taskOid = ${oid}`
      };

      // @ts-ignore
      const { data } = await this.$axios.get(uri, { params });

      await commit('SET_MESSAGE_DELIVERY_STATS', data[0]);
      return true;

    } catch (error) {

      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message delivery stats' });
      return false;

    } finally {
      commit('SET_IS_FETCHING_MESSAGE_DELIVERY_STATS', false);
    }
  },

  async CONVERSION_SET_EVENTS({ commit, rootState, state }, messageOid: string) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    const eventsData = state.conversionSelectedEvents.map(oid => ({ targetType: 'event-purchase', targetOid: Number(oid) }));

    const uri = `/promoter/${promoterOid}/attribution`;
    commit('SET_IS_FETCHING_CONVERSIONS_STATS', true);
    try {
      const params = {
        sourceType: 'fan-message',
        sourceOid: Number(messageOid),
        targets: eventsData,
      };

      await this.$axios.post(uri, params);
      return true;
    } catch (error) {

      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to set conversion events' });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CONVERSIONS_STATS', false);
    }
  },

  async FETCH_CONVERSION_STATS_TIMESERIES({ commit, rootState }, messageOid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(messageOid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion graph' });
      return null;
    }
    const uri = `/promoter/${promoterOid}/attribution-stats`;
    commit('SET_IS_FETCHING_CONVERSIONS_GRAPH', true);
    try {
      const params = {
        sourceType: 'fan-message',
        sourceOid: Number(messageOid),
      };

      const { data } = await this.$axios.post(uri, params);
      const resultData: ConversionGraphTimeseries[] = [];
      data.forEach((item: ConversionGraphTimeseries) => {
        resultData.push(item);
      });
      commit('SET_CONVERSIONS_GRAPH_TIMESERIES', resultData);

      return true;
    } catch (error) {

      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion graph' });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CONVERSIONS_GRAPH', false);
    }
  },

  // Fetch data for conversion table
  async FETCH_CONVERSION_RECIPIENTS({ commit, state, rootState }, messageOid) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(messageOid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion table' });
      return null;
    }
    const uri = `/promoter/${promoterOid}/attribution-data?$search=${state.conversionTableSearch}&$count=true`;
    commit('SET_IS_FETCHING_CONVERSIONS_STATS', true);
    try {
      const params = {
        sourceType: 'fan-message',
        sourceOid: Number(messageOid),
      };

      const { data } = await this.$axios.post(uri, params);
      commit('SET_CONVERSIONS_TABLE_DATA', data.data);

      commit('SET_CONVERSION_TABLE_COUNT', data.count ? data.count : 0);

      return true;
    } catch (error) {

      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion table' });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CONVERSIONS_STATS', false);
    }
  },

  async FETCH_CONVERSION_STATISTICS({ commit, state, rootState, dispatch }, {messageOid, isSetFromSaved = false}) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(messageOid)) {
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion statistic' });
      return null;
    }

    const intervalTime = 15000;
    clearTimeout(state.calculationsTimeoutId);
    commit('SET_CALCULATIONS_TIMEOUT_ID', null);

    const uri = `/promoter/${promoterOid}/attribution-indicators`;
    commit('SET_IS_FETCHING_CONVERSIONS_STATS', true);
    try {
      const params = {
        sourceType: 'fan-message',
        sourceOid: Number(messageOid),
      };

      const { data } = await this.$axios.post(uri, params);
      await commit('SET_CONVERSIONS_STATS', data.indicators);

      const selectedEvents = data.indicators.map((event: ConversionStats) => event.targetOid);
      if (isSetFromSaved && selectedEvents.length) commit('SET_CONVERSIONS_SELECTED_EVENTS', selectedEvents);

      if (data.status === 'finished') commit('SET_IS_CALCULATIONS_FINISHED', true);
      else {
        commit('SET_IS_CALCULATIONS_FINISHED', false)

        const timeoutId = setTimeout(() => {
          dispatch('FETCH_CONVERSION_STATISTICS', { messageOid });
        }, intervalTime);
        commit('SET_CALCULATIONS_TIMEOUT_ID', timeoutId);
      }

      return data;
    } catch (error) {

      commit('SET_IS_CALCULATIONS_FINISHED', true)
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch conversion statistic' });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CONVERSIONS_STATS', false);
    }
  },
};
