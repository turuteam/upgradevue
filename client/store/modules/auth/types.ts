/**
 * State of Auth Module
 * @field account Account info fetched from server
 * @field xAuthToken Token used for authentication
 */
export type AuthState = {
  account: PromoterAccount | null;
  xAuthToken: string | null;
  isDoingLogin: boolean;
  nextLoginRetryTime: number | null;
  isDoingSignup: boolean;
  isChangingPassword: boolean;
  isSendingResetPasswordEmail: boolean;
  nextSendResetPasswordEmailRetryTime: number | null;
  isResettingPassword: boolean;
  isVerifyingEmailAddress: boolean;
  storedEmailAddress: string | null;
  useSampling: boolean;
  emailEditorSetting: string | null;
}
