import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { MessageSenderState, ScratchEmailSender } from './types';
import { EmailSenderProperty } from '@/api/message-senders/types';

export const messageSenderActions: ActionTree<MessageSenderState, RootState> = {
  async FETCH_MESSAGE_SENDERS({ rootState, commit }) {
    if (!rootState.auth.account) {
      return null;
    }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_MESSAGE_SENDERS', true);

      let uri = `promoter/${promoterOid}/property`;

      const { data: { rows } } = await this.$axios.get(uri, {
        params: {
          $top:'all',
          $count: true,
          $filter: 'type = promoter-email-verification',
        }
      });

      const cleanedData = rows.map((item: EmailSenderProperty) => {
        if (!item.additionalInfo) {
          return {
            ...item,
            additionalInfo: {},
          };
        } else {
          return item;
        }
      });

      commit('SET_MESSAGE_SENDERS', cleanedData);

    } catch(error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch emails',
      });
    } finally {
      commit('SET_IS_FETCHING_MESSAGE_SENDERS', false);
    }
  },

  async FETCH_CURRENT_MESSAGE_SENDER({ rootState, commit }, {
    oid = null,
    allowDeleted = false,
  }) {
    if (!rootState.auth.account) {
      return null;
    }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('RESET_CURRENT_MESSAGE_SENDER');
      commit('SET_IS_DELETING_MESSAGE_SENDER', true);

      const uri = allowDeleted ? `promoter/${promoterOid}/property` : `promoter/${promoterOid}/property/${oid}`;

      const { data } = await this.$axios.get(uri, {
        params: {
          $filter: allowDeleted ? `oid=${oid} AND (sysActivep=false OR sysActivep)` : null,
        }
      });

      if (allowDeleted && data.length > 0) {
        commit('SET_CURRENT_MESSAGE_SENDER', data[0]);
      } else {
        commit('SET_CURRENT_MESSAGE_SENDER', data);
      }

      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch email',
      });
      return false;
    } finally {
      commit('SET_IS_DELETING_MESSAGE_SENDER', false);
    }
  },

  async ADD_MESSAGE_SENDER({ rootState, commit }, messageSender: ScratchEmailSender) {
    if (!rootState.auth.account) {
      return null;
    }
    const { promoterOid, oid } = rootState.auth.account;
    const promoterAccountOid = oid;

    try {
      commit('SET_IS_CREATING_MESSAGE_SENDER', true);

      const uri = `promoter/${promoterOid}/property`;
      const payload = {
        property: messageSender.property,
        promoterOid,
        promoterAccountOid,
        type: 'promoter-email-verification',
        verified: false,
        additionalInfo: {
          senderName: messageSender.additionalInfo.senderName,
          businessAddress: messageSender.additionalInfo.businessAddress,
        }
      };
      const { data } = await this.$axios.post(uri, payload);
      commit('ADD_TO_MESSAGE_SENDERS', data);

      // Verify email
      await this.$axios.put(`/promoter/${promoterOid}/verify-promoter-email/${data.oid}`);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully created new email',
      });
      return data;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create new email',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_MESSAGE_SENDER', false);
    }
  },

  async RESEND_EMAIL_VERIFICATION({ rootState, commit, state }, propertyOid) {
    if (state.isResendingEmailVerification) {
      return;
    }
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_RESENDING_EMAIL_VERIFICATION', true);
      const response = await this.$axios.put(`/promoter/${promoterOid}/verify-promoter-email/${propertyOid}`);
  
      if (response.status !== 204) {
        console.error(`Response has wrong status code ${response.status}`);
      }
      this.$arNotification.push({
        type: 'success',
        message: 'Verification email sent',
      });
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to resend verification email',
      });
    } finally {
      commit('SET_IS_RESENDING_EMAIL_VERIFICATION', false);
    }
  },

  async UPDATE_MESSAGE_SENDER({ rootState, commit, state }, messageSender: EmailSenderProperty) {
    if (!rootState.auth.account) {
      return null;
    }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_PATCHING_MESSAGE_SENDERS', true);

      const uri = `promoter/${promoterOid}/property/${messageSender.oid}`;
      const payload = {
        additionalInfo: {
          senderName: messageSender.additionalInfo.senderName,
          businessAddress: messageSender.additionalInfo.businessAddress,
        }
      };
      await this.$axios.patch(uri, payload);
      commit('PATCH_IN_MESSAGE_SENDERS', { oid: messageSender.oid, changes: payload });
      if (state.currentMessageSender?.oid === messageSender.oid) {
        commit('PATCH_CURRENT_MESSAGE_SENDER', messageSender);
      }
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated email',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update email',
      });
      return false;
    } finally {
      commit('SET_IS_PATCHING_MESSAGE_SENDERS', false);
    }
  },


  async DELETE_MESSAGE_SENDER({ rootState, commit, state }, oid: number) {
    if (!rootState.auth.account) {
      return null;
    }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_DELETING_MESSAGE_SENDER', true);
      const uri = `promoter/${promoterOid}/property/${oid}`;
      await this.$axios.delete(uri);
      commit('REMOVE_FROM_MESSAGE_SENDERS', oid);
      if (state.currentMessageSender?.oid === oid) {
        commit('RESET_CURRENT_MESSAGE_SENDER');
      }

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully deleted email',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete email',
      });
      return false;
    } finally {
      commit('SET_IS_DELETING_MESSAGE_SENDER', false);
    }
  }
};
