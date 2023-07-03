import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { MessagePreviewState } from './types';
import { recursivelyPurifyUnlayerDesign } from '@/store/modules/message/utils';

export const messagePreviewActions: ActionTree<MessagePreviewState, RootState> = {
  async FETCH_MESSAGE({ commit }, hash) {
    if (!hash) {
      console.error("FETCH_MESSAGE failed due to missing hash.");
      return;
    }

    this.$axios.get(`/message-preview?hash=${encodeURIComponent(hash)}`)
      .then((res) => {
        commit('SET_MESSAGE_PREVIEW', res.data);
      }).catch((error) => {
        commit('SET_PREVIEW_ERROR', error.response.data?.error || error.message);
      });
  },

  async GENERATE_RESOURCE_URL({ commit }, messageOid) {
    if (!messageOid) {
      console.error("GENERATE_RESOURCE_URL failed due to wrong messageOid received.");
      return;
    }

    const { data } = await this.$axios.post(`/generate-resource-url`, { "message-task-oid": messageOid });
    commit('SET_RESOURCE_HASH', data.hash);
  },

  async GENERATE_EMAIL_HTML({ state, commit, rootState }) {
    if (!state.message) { return; }
    // if (!rootState.auth.account) { return null; }
    // const promoterOid = rootState.auth.account.promoterOid;

    const { presentation } = state.message;
    let emailHtml;
    try {
      if (presentation.templateType === 'unlayer') {
        recursivelyPurifyUnlayerDesign(null, presentation.template);
        const unlayerOutput = await this.$api.unlayer.exportHtml(presentation.template);
        emailHtml = unlayerOutput.html;
      } else if (presentation.templateType === 'beefree') {
        // TO DO: Check if this section is still necessary
      } else if (presentation.templateType === 'rich-text') {
        emailHtml = presentation.template;
      }
      commit('SET_EMAIL_HTML', emailHtml);
      return true;
    } catch (e) {
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to generate email html',
      });
      return false;
    }
  },
};
