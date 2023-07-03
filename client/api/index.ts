import { NuxtAxiosInstance } from "@nuxtjs/axios";

// APIs
import Auth from '@/api/auth/'
import Campaign from '@/api/campaigns/'
import Brand from '@/api/brands/'
import Event from '@/api/events/'
import RsvpPage from '@/api/rsvp-pages/'
import EventAnnotations from '@/api/event-annotations/'
import PromoterAccounts from '@/api/promoter-accounts/'
import Audience from '@/api/audience/'
import Tags from '@/api/tags/'
import MessageLists from '@/api/message-lists/'
import CustomerProfile from '@/api/customer-profile/'
import Automation from '@/api/automation/'
import Integrations from '@/api/integrations/'
import PromoterIntegrations from '@/api/promoter-integrations/'
import Unlayer from '@/api/unlayer/'
import Recipients from '@/api/recipients/'
import Buckets from '@/api/buckets/'
import Messages from '@/api/messages/'
import MessageSenders from '@/api/message-senders/'
import Csv from '@/api/csv/'
import PromoterIntegrationTask from '@/api/promoter-integration-task'
import Activity from '@/api/activity';
import Beefree from '@/api/beefree/'
import TicketClass from '@/api/ticket-classes';
import ApiTokens from '@/api/api-tokens';


export const createAPIs = (axios: NuxtAxiosInstance) => ({
  auth: Auth(axios),
  campaign: Campaign(axios),
  brand: Brand(axios),
  event: Event(axios),
  rsvpPage: RsvpPage(axios),
  eventAnnotations: EventAnnotations(axios),
  promoterAccounts: PromoterAccounts(axios),
  audience: Audience(axios),
  tags: Tags(axios),
  messageLists: MessageLists(axios),
  customerProfile: CustomerProfile(axios),
  automation: Automation(axios),
  integrations: Integrations(axios),
  promoterIntegrations: PromoterIntegrations(axios),
  unlayer: Unlayer(axios),
  recipients: Recipients(axios),
  buckets: Buckets(axios),
  messages: Messages(axios),
  messageSenders: MessageSenders(axios),
  csv: Csv(axios),
  promoterIntegrationTask: PromoterIntegrationTask(axios),
  activity: Activity(axios),
  beefree: Beefree(axios),
  ticketClasses: TicketClass(axios),
  apiTokens: ApiTokens(axios)
});
