import Vuex from 'vuex';
import * as actions from './actions';

import applicationModule, { initialApplicationState } from './modules/application/';
import segmentModule, { initialSegmentState } from './modules/segment/';
import layoutModule, { initialLayoutState } from './modules/layout/';
import authModule, { initialAuthState } from './modules/auth/';
import eventModule, { initialEventState } from './modules/event/';
import campaignModule, { initialCampaignState } from './modules/campaign/';
import brandModule, { initialBrandState } from './modules/brand/';
import tourModule, { initialTourState } from './modules/tour/';
import insightModule, { initialInsightStates } from './modules/insights';
import accessibilityModule, { initialAccessibilityState } from './modules/accessibility/';
import paymentModule, { initialPaymentState } from './modules/payment/';
import messageModule, { initialMessageState } from './modules/message/';
import emailTemplateModule, { initialEmailTemplateStates } from './modules/emailTemplate';
import messageListModule, { initialMessageListState } from './modules/messageList/';
import subscriberModule, { initialSubscriberState } from './modules/subscriber/';
import recipientModule, { initialRecipientState } from './modules/recipient/';
import messageSenderModule, { initialMessageSenderState } from './modules/messageSender/';
import audienceModule, { initialAudienceState } from './modules/audience/';
import ordersModule, { initialOrdersState } from './modules/orders/';
import posOrdersModule, { initialPOSOrdersState } from './modules/posOrders/';
import tagModule, { initialTagState } from './modules/tag/';
import signupFormModule, { initialSignupFormState } from './modules/signupForm/';
import eventRSVPFormModule, { initialEventRSVPFormState } from './modules/eventRSVPForm/';
import adminModule, { initialAdminState } from './modules/admin/';
import privacyPortalModule, { initialPrivacyPortalState } from './modules/privacyPortal/';
import integrationModule, { initialIntegrationState } from './modules/integration';
import facebookMessengerIntegrationModule, { initialFacebookMessengerIntegrationState } from './modules/facebookMessengerIntegration/';
import facebookCAIntegrationModule, { initialFacebookCAIntegrationState } from './modules/facebookCAIntegration/';
import shopifyIntegrationModule, { initialShopifyIntegrationState } from './modules/shopifyIntegration/';
import zoomIntegrationModule, { initialZoomIntegrationState } from './modules/zoomIntegration/';
import patreonIntegrationModule, { initialPatreonIntegrationState } from './modules/patreonIntegration/';
import universeIntegrationModule, { initialUniverseIntegrationState } from './modules/universeIntegration';
import stripeIntegrationModule, { initialStripeIntegrationState } from './modules/stripeIntegration';
import ticketekIntegrationModule, { initialTicketekIntegrationState } from './modules/ticketekIntegration';
import moshtixIntegrationModule, { initialMoshtixIntegrationState } from './modules/moshtixIntegration';
import eventixIntegrationModule, { initialEventixIntegrationState } from './modules/eventixIntegration';
import memberfulIntegrationModule, { initialMemberfulIntegrationState } from './modules/memberfulIntegration/';
import eventbriteIntegrationModule, { initialEventbriteIntegrationState } from './modules/eventbriteIntegration/';
import eventGeniusIntegrationModule, { initialEventGeniusIntegrationState } from './modules/eventGeniusIntegration';
import diceIntegrationModule, { initialDiceIntegrationState } from './modules/diceIntegration';
import humanitixIntegrationModule, { initialHumanitixIntegrationState } from './modules/humanitixIntegration';
import workatoIntegrationModule, { initialWorkatoIntegrationState } from './modules/workatoIntegration';
import tryBookingIntegrationModule, { initialTryBookingIntegrationState } from './modules/tryBookingIntegration';
import customerModule, { initialCustomerState } from './modules/customer';
import automationModule, { initialAutomationState } from './modules/automation';
import promoterTasksModule, { initialPromoterTasksState } from './modules/promoterTasks';
import dashboardModule, { initialDashboardState } from './modules/dashboard';
import messagePreviewModule, { initialMessagePreviewState } from './modules/messagePreview';
import shortUrlsModule, { initialShortUrlsState } from './modules/shortUrl'

import applicationPlugin from './modules/application/plugin';
import apiTokenModule, { initialApiTokenState } from './modules/apiToken';


// TODO - make this file a .ts file
// import { RootState } from './modules/types';

const modules = {
  application: applicationModule,
  segment: segmentModule,
  layout: layoutModule,
  auth: authModule,
  event: eventModule,
  campaign: campaignModule,
  brand: brandModule,
  tour: tourModule,
  insight: insightModule,
  accessibility: accessibilityModule,
  payment: paymentModule,
  message: messageModule,
  emailTemplate: emailTemplateModule,
  messageList: messageListModule,
  subscriber: subscriberModule,
  recipient: recipientModule,
  messageSender: messageSenderModule,
  audience: audienceModule,
  orders: ordersModule,
  posOrders: posOrdersModule,
  tag: tagModule,
  signupForm: signupFormModule,
  eventRSVPForm: eventRSVPFormModule,
  customer: customerModule,
  admin: adminModule,
  privacyPortal: privacyPortalModule,
  automation: automationModule,
  integration: integrationModule,
  apiToken: apiTokenModule,
  facebookMessengerIntegration: facebookMessengerIntegrationModule,
  facebookCAIntegration: facebookCAIntegrationModule,
  eventbriteIntegration: eventbriteIntegrationModule,
  shopifyIntegration: shopifyIntegrationModule,
  zoomIntegration: zoomIntegrationModule,
  patreonIntegration: patreonIntegrationModule,
  universeIntegration: universeIntegrationModule,
  stripeIntegration: stripeIntegrationModule,
  ticketekIntegration: ticketekIntegrationModule,
  moshtixIntegration: moshtixIntegrationModule,
  eventixIntegration: eventixIntegrationModule,
  eventGeniusIntegration: eventGeniusIntegrationModule,
  diceIntegration: diceIntegrationModule,
  humanitixIntegration: humanitixIntegrationModule,
  tryBookingIntegration: tryBookingIntegrationModule,
  memberfulIntegration: memberfulIntegrationModule,
  workatoIntegration: workatoIntegrationModule,
  promoterTasks: promoterTasksModule,
  dashboard: dashboardModule,
  messagePreview: messagePreviewModule,
  shortUrls: shortUrlsModule,
}

const storeConfig = {
  modules: modules,
  state: initialState,
  actions: {
    ...actions,
  },
  mutations: {
    RESET_STATE: state => {
      Object.assign(state, initialState())
    },
  },
  plugins: [applicationPlugin],
}

// Initial State
export const initialState = () => ({
  application: initialApplicationState(),
  segment: initialSegmentState(),
  layout: initialLayoutState(),
  auth: initialAuthState(),
  event: initialEventState(),
  campaign: initialCampaignState(),
  socialAccount: initialBrandState(),
  tour: initialTourState(),
  insight: initialInsightStates(),
  accessibility: initialAccessibilityState(),
  payment: initialPaymentState(),
  message: initialMessageState(),
  emailTemplate: initialEmailTemplateStates(),
  messageList: initialMessageListState(),
  subscriber: initialSubscriberState(),
  initialRecipient: initialRecipientState(),
  messageSender: initialMessageSenderState(),
  audience: initialAudienceState(),
  orders: initialOrdersState(),
  posOrders: initialPOSOrdersState(),
  tag: initialTagState(),
  signupForm: initialSignupFormState(),
  eventRSVPForm: initialEventRSVPFormState(),
  customer: initialCustomerState(),
  admin: initialAdminState(),
  privacyPortal: initialPrivacyPortalState(),
  automation: initialAutomationState(),
  integration: initialIntegrationState(),
  apiToken: initialApiTokenState(),
  facebookMessengerIntegration: initialFacebookMessengerIntegrationState(),
  facebookCAIntegration: initialFacebookCAIntegrationState(),
  shopifyIntegration: initialShopifyIntegrationState(),
  zoomIntegration: initialZoomIntegrationState(),
  patreonIntegration: initialPatreonIntegrationState(),
  memberfulIntegrationState: initialMemberfulIntegrationState(),
  universeIntegration: initialUniverseIntegrationState(),
  stripeIntegration: initialStripeIntegrationState(),
  ticketekIntegrationState: initialTicketekIntegrationState(),
  moshtixIntegrationState: initialMoshtixIntegrationState(),
  eventixIntegrationState: initialEventixIntegrationState(),
  eventbriteIntegration: initialEventbriteIntegrationState(),
  eventGeniusIntegrationState: initialEventGeniusIntegrationState(),
  diceIntegrationState: initialDiceIntegrationState(),
  humanitixIntegrationState: initialHumanitixIntegrationState(),
  tryBookingIntegrationState: initialTryBookingIntegrationState(),
  workatoIntegrationState: initialWorkatoIntegrationState(),
  promoterTasks: initialPromoterTasksState(),
  dashboardModule: initialDashboardState(),
  messagePreview: initialMessagePreviewState(),
  shortUrls: initialShortUrlsState(),
  route: {},
})

const createStore = () => new Vuex.Store(storeConfig)

export default createStore;
