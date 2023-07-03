import { AccessibilityState } from './accessibility';
import { ApplicationState } from './application/types';
import { AuthState } from './auth/types';
import { EventState } from './event/types';
import { CampaignState } from './campaign/types';
import { BrandState } from './brand/types';
import { TourState } from './tour/types';
import { InsightState } from './insights/types';
import { SegmentState } from './segment/types';
import { LayoutState } from './layout';
import { PaymentState } from './payment/types';
import { SignupFormState } from './signupForm/types';
import { MessageState } from './message/types';
import { EmailTemplateState } from './emailTemplate/types';
import { MessageListState } from './messageList/types';
import { SubscriberState } from './subscriber/types';
import { MessageSenderState } from './messageSender/types';
import { AudienceState } from './audience/types';
import { TagState } from './tag/types';
import { PrivacyPortalState } from './privacyPortal/types';
import { IntegrationState } from './integration/types';
import { FacebookMessengerIntegrationState } from './facebookMessengerIntegration/types';
import { FacebookCAIntegrationState } from './facebookCAIntegration/types';
import { ShopifyIntegrationState } from './shopifyIntegration/types';
import { EventbriteIntegrationState } from './eventbriteIntegration/types';
import { ZoomIntegrationState } from './zoomIntegration/types';
import { PatreonIntegrationState } from './patreonIntegration/types';
import { UniverseIntegrationState } from './universeIntegration/types';
import { StripeIntegrationState } from './stripeIntegration/types';
import { TicketekIntegrationState } from './ticketekIntegration/types';
import { MoshtixIntegrationState } from './moshtixIntegration/types';
import { EventixIntegrationState } from './eventixIntegration/types';
import { MemberfulIntegrationState } from './memberfulIntegration/types';
import { DiceIntegrationState } from './diceIntegration/types';
import { HumanitixIntegrationState } from './humanitixIntegration/types';
import { EventGeniusIntegrationState } from './eventGeniusIntegration/types';
import { PromoterTasksState } from './promoterTasks/types';
import { ApiTokenState } from './apiToken/types';

export type RootState = {
  apiToken: ApiTokenState;
  segment: SegmentState;
  application: ApplicationState;
  layout: LayoutState;
  auth: AuthState;
  event: EventState;
  campaign: CampaignState;
  socialAccount: BrandState;
  tour: TourState;
  insight: InsightState;
  accessibility: AccessibilityState;
  payment: PaymentState;
  signupForm: SignupFormState;
  message: MessageState;
  emailTemplate: EmailTemplateState;
  messageList: MessageListState,
  subscriber: SubscriberState,
  messageSender: MessageSenderState,
  audience: AudienceState;
  tag: TagState;
  privacyPortal: PrivacyPortalState;
  integration: IntegrationState;
  facebookMessengerIntegration: FacebookMessengerIntegrationState;
  facebookCAIntegration: FacebookCAIntegrationState;
  shopifyIntegration: ShopifyIntegrationState;
  eventbriteIntegration: EventbriteIntegrationState;
  zoomIntegration: ZoomIntegrationState;
  patreonIntegration: PatreonIntegrationState;
  memberfulIntegration: MemberfulIntegrationState;
  universeIntegration: UniverseIntegrationState;
  stripeIntegration: StripeIntegrationState;
  ticketekIntegration: TicketekIntegrationState;
  moshtixIntegration: MoshtixIntegrationState;
  eventixIntegrationState: EventixIntegrationState;
  eventGeniusIntegration: EventGeniusIntegrationState;
  diceIntegration: DiceIntegrationState;
  humanitixIntegration: HumanitixIntegrationState
  promoterTasksState: PromoterTasksState;
  route: any,
}
