import { ActionTree } from 'vuex';
import moment from 'moment';
import { RootState } from '@/store/modules/types';
import { AuthState } from './types';
import { getCookie } from '../../../utils/cookie'

export const authActions: ActionTree<AuthState, RootState> = {
  async REGISTER_TO_WAVE({ commit }, { emailAddress, password, firstName, lastName, company, mobileNumber, country }) {
    try {
      commit('SET_IS_DOING_SIGNUP', true);
      const successRedirectUri = await this.$api.auth.registerToWaveApp({ emailAddress, password, firstName, lastName, company, mobileNumber, country });
      window.location.href = successRedirectUri;
    } catch(e: any) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        this.$arNotification.push({
          type: 'error',
          message: 'There is already an account with this email address,',
          link: 'Login here',
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to create an account',
        });
      }
      return false;
    } finally {
      commit('SET_IS_DOING_SIGNUP', false);
    }
  },
  async SIGNUP({ commit }, { emailAddress, password, firstName, lastName, company, mobileNumber, country, companyCategory }) {
    try {
      commit('SET_IS_DOING_SIGNUP', true);
      
      let pardotCookie = null;

      if (!!process.env.arSalesforceID) {
        pardotCookie = getCookie(`visitor_id${process.env.arSalesforceID}`);
      }

      const { headers, status, data } = await this.$axios.post('/signup', { emailAddress, password, firstName, lastName, company, mobileNumber, country, companyCategory, pardotCookie });

      if (status !== 201) { throw new Error("Failed to login"); }

      commit('SET_PROMOTER_ACCOUNT', data.account);
      commit('SET_X_AUTH_TOKEN', headers["x-auth-token"]);
      window.sessionStorage.setItem('x-auth-token', headers["x-auth-token"]);

      return true;
    } catch(e: any) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        this.$arNotification.push({
          type: 'error',
          message: 'There is already an account with this email address,',
          link: 'Login here',
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to create an account',
        });
      }
      return false;
    } finally {
      commit('SET_IS_DOING_SIGNUP', false);
    }
  },
  async LOGIN({ getters, commit }, { emailAddress, password, targetAccountEmailAddress, masquerade }) {
    try {
      commit('SET_IS_DOING_LOGIN', true);

      let url;
      let payload;
      let pardotCookie = null;

      if (!!process.env.arSalesforceID) {
        pardotCookie = getCookie(`visitor_id${process.env.arSalesforceID}`);
      }
      
      if (masquerade) {
        url = '/session-masquerade';
        payload = { emailAddress, password, targetAccountEmailAddress, pardotCookie };
      } else {
        url = '/session';
        payload = { emailAddress, password, pardotCookie };
      }

      const { headers, status, data } = await this.$axios.post(url, payload);

      if (status !== 201) {
        throw new Error("Failed to login");
      }

      commit('SET_PROMOTER_ACCOUNT', data.account);
      commit('SET_SAMPLING', data.account.promoterOid === 18);
      commit('SET_X_AUTH_TOKEN', headers["x-auth-token"]);
      window.sessionStorage.setItem('x-auth-token', headers["x-auth-token"])

      if (getters.isAdminAccount) {
        this.$router.push(`/admin/dashboard`);
      } else {
        const promoterEmailEditorSetting = await this.$api.beefree.getPromoterEmailEditorSetting(data.account.promoterOid)
        if (!!promoterEmailEditorSetting) {
          commit('SET_EMAIL_EDITOR_SETTING', promoterEmailEditorSetting.property);
        }
        this.$router.push(`/audience`);
      }
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 429) {

        // The server says we've tried too many times; the server will return the time to wait
        // in seconds before we can start the next request
        const { nextAllowedLoginAttemptTime } = e.response.data.message.details;
        commit('SET_NEXT_LOGIN_RETRY_TIME', moment.utc(nextAllowedLoginAttemptTime).toDate().getTime());
        this.$arNotification.push({ type: 'error', message: 'Too many login attempts', timeout: 5000});
      } else if (e.response && e.response.status === 402) {
        this.$arNotification.push({ type: 'error', message: 'Your account has been disabled, contact support@audiencerepublic.com'});
      } else {
        const { remainingAttempts } = e.response.data.result
        this.$arNotification.push({ type: 'error', message: `Failed to login, remaining attempts ${remainingAttempts}`});
      }
    } finally {
      commit('SET_IS_DOING_LOGIN', false);
    }
  },
  async LOGOUT({ commit, rootGetters }) {
    window.sessionStorage.clear();
    commit('RESET_STATE', null, { root: true });
    this.$router.push({
      path: '/authenticate/login',
    });
  },
  async VERIFY_TOKEN({ commit, getters }) {
    try {
      const { data, headers } = await this.$axios.get('/session');
      commit('SET_PROMOTER_ACCOUNT', data);
      commit('SET_X_AUTH_TOKEN', window.sessionStorage.getItem('x-auth-token'));

      if (this.$router.currentRoute.path === '/authenticate/login') {
        if (getters.isAdminAccount) {
          this.$router.push(`/admin/dashboard`);
        } else {
          this.$router.push(`/audience`);
        }
      } else {
        const promoterEmailEditorSetting = await this.$api.beefree.getPromoterEmailEditorSetting(data.promoterOid)
        if (!!promoterEmailEditorSetting) {
          commit('SET_EMAIL_EDITOR_SETTING', promoterEmailEditorSetting.property);
        }
      }
      return true;
    } catch (e) {
      console.error(e);
      // Important, if x-auth-token is not valid, remove it otherwise it will be an infinite loop
      window.sessionStorage.clear();
      this.$router.push('/authenticate/login');

      return false;
    }
  },
  async CHANGE_PASSWORD({ commit, state }, { oldPassword, password }) {
    if (!state.account) { return null; }
    const { promoterOid, oid } = state.account;
    try {
      commit('SET_IS_CHANING_PASSWORD', true);
      await this.$axios.post(`/promoter/${promoterOid}/account/${oid}/password-change`, {
        oldPassword,
        password,
      });
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully changed password',
      });
      return true;
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 403) {
        this.$arNotification.push({
          type: 'error',
          message: 'Password change failed. Please ensure details are correct',
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to change password',
        });
      }
      return false;
    } finally {
      commit('SET_IS_CHANING_PASSWORD', false);
    }
  },
  async SEND_RESET_PASSWORD_EMAIL({ commit }, emailAddress) {
    try {
      commit('SET_IS_SENDING_RESET_PASSWORD_EMAIL', true);
      const { data: { nextResetRequestTime } } = await this.$axios.post('/request-password-reset', { emailAddress });
      // Start to count down for availability of next request
      commit('SET_NEXT_SEND_RESET_PASSWORD_EMAIL_RETRY_TIME', moment.utc(nextResetRequestTime).toDate().getTime());

      this.$arNotification.push({
        type: 'success',
        message: 'You will receive an email with instructions about how to reset your password in a few minutes.',
      });
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 429) {
        // Edge case, if user skip our mechanism to send request before it's available
        commit('SET_NEXT_SEND_RESET_PASSWORD_EMAIL_RETRY_TIME', moment.utc(e.response.data.message.details.nextResetRequestTime).toDate().getTime());
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to send reset instructions',
        });
      }
    } finally {
      commit('SET_IS_SENDING_RESET_PASSWORD_EMAIL', false);
    }
  },
  async RESET_FORGOTTEN_PASSWORD({ commit, getters }, { password, verifyToken }) {
    try {
      commit('SET_IS_RESETTING_PASSWORD', true);
      const { headers, data } = await this.$axios.post('/password-reset', {
        password,
        verifyToken,
      });

      commit('SET_PROMOTER_ACCOUNT', data.account);
      commit('SET_X_AUTH_TOKEN', headers["x-auth-token"]);
      window.sessionStorage.setItem('x-auth-token', headers["x-auth-token"]);

      if (getters.isAdminAccount) {
        this.$router.push(`/admin/dashboard`);
      } else {
        const promoterEmailEditorSetting = await this.$api.beefree.getPromoterEmailEditorSetting(data?.account?.promoterOid || data?.promoterOid)
        if (!!promoterEmailEditorSetting) {
          commit('SET_EMAIL_EDITOR_SETTING', promoterEmailEditorSetting.property);
        }
        
        this.$router.push(`/audience`);
      }
      this.$arNotification.push({
        type: 'success',
        message: 'Success! Your password has been reset',
      });
    } catch (e) {
      console.error(e);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to reset password',
      });
    } finally {
      commit('SET_IS_RESETTING_PASSWORD', false);
    }
  },
  async VERIFY_EMAIL_ADDRESS({ commit, getters }, { emailAddress, verifyToken }) {
    try {
      commit('SET_IS_VERIFYING_EMAIL_ADDRESS', true);
      const { headers, data } = await this.$axios.post('/email-verify', { emailAddress, verifyToken });

      commit('SET_PROMOTER_ACCOUNT', data.account);
      commit('SET_X_AUTH_TOKEN', headers["x-auth-token"]);
      window.sessionStorage.setItem('x-auth-token', headers["x-auth-token"]);

      // Let's always to go to message center if you're normal promoter
      if (getters.isAdminAccount) {
        this.$router.push(`/admin/dashboard`);
      } else {
        const promoterEmailEditorSetting = await this.$api.beefree.getPromoterEmailEditorSetting(data?.account?.promoterOid || data?.promoterOid)
        if (!!promoterEmailEditorSetting) {
          commit('SET_EMAIL_EDITOR_SETTING', promoterEmailEditorSetting.property);
        }

        this.$router.push(`/message-center/messages`);
      }

      this.$arNotification.push({
        type: 'success',
        message: 'Success! Your email address has been verified',
      });
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 500) {
        // It it's 500, that means unexpected error happened on server side
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to verify your email',
        });
      } else if (e.response && e.response.status === 403) {
        // It it's 500, that means unexpected error happened on server side
        this.$arNotification.push({
          type: 'error',
          message: 'The verify token is invalid',
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Your verification link has expired. You need to log and resend the verification email',
          timeout: 10000,
        });
        this.$router.push({
          path: '/authenticate/login',
          query: { emailAddress },
        });
      }
    } finally {
      commit('SET_IS_VERIFYING_EMAIL_ADDRESS', false);
    }
  },
};
