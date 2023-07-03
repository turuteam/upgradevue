import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { Campaign } from '@/types/resources/campaign';
import { clone } from '@/utils/helpers';
import { AREvent } from '@/store/modules/event/types';
import { customerActions } from './actions';
import { PrunedActivity, CustomerState, PrunedCustomer, PrunedPurchase, LoyaltyProgramTiersMap } from './types';
import { FanLoyaltyMembership, LoyaltyProgram } from '@/api/customer-profile/types';
import { countryList } from '@/utils/countries';
import moment from 'moment';
import { formatFanName } from '@/store/modules/audience/utils';
import { formatCustomerLocation } from './utils';

export const initialCustomerState = (): CustomerState => ({
  customer: null,
  isFetchingCustomer: false,
  hasFetchCustomerFailed: false,

  // Customer Tags
  fanTags: [],
  isFetchingFanTags: false,

  // Customer Activities
  fanActivity: [],
  noMoreActivity: false,
  isFetchingActivity: false,
  hasFetchCustomerActivityFailed: false,
  lastActivityType: 'important',

  // Customer Purchase
  fanPurchases: [],
  noMorePurchases: false,
  isFetchingPurchases: false,
  hasFetchCustomerPurchasesFailed: false,

  // Customer Events
  fanEvents: [],
  actionedEventOids: [],
  isFetchingEvents: false,
  hasFetchCustomerEventsFailed: false,

  // Customer Campaigns
  fanCampaigns: [],
  actionedCampaignOids: [],
  isFetchingCampaigns: false,
  hasFetchCustomerCampaignsFailed: false,

  // Customer Loyalty Memberships
  fanLoyaltyMemberships: [],
  isFetchingLoyaltyMemberships: false,
  loyaltyProgramTiersMap: {},

  // Customer Loyalty Programs
  fanLoyaltyPrograms: [],
  isFetchingLoyaltyPrograms: false,
});

const customerModule: Module<CustomerState, RootState> = {
  namespaced: true,
  state: initialCustomerState,
  actions: customerActions,
  mutations: {
    // Resets all customer data so that you don't need to call multiple reset methods
    RESET_CUSTOMER_DATA(state) {
      state.customer = null;
      state.fanTags = [];
      state.noMoreActivity = false;
      state.hasFetchCustomerFailed = false;
      state.fanActivity = [];
      state.fanEvents = [];
      state.actionedEventOids = [];
      state.hasFetchCustomerEventsFailed = false;
      state.fanCampaigns = [];
      state.actionedCampaignOids = [];
      state.hasFetchCustomerCampaignsFailed = false;
      state.fanPurchases = [];
      state.noMorePurchases = false;
      state.hasFetchCustomerPurchasesFailed = false;
      state.fanLoyaltyMemberships = [];
      state.isFetchingLoyaltyMemberships = false;
      state.loyaltyProgramTiersMap = {};
      state.fanLoyaltyPrograms = [];
      state.isFetchingLoyaltyPrograms = false;

    },
    // For fetching fans
    RESET_CUSTOMERS(state) {
      state.customer = null;
    },
    SET_IS_FETCHING_CUSTOMERS(state, isFetchingCustomer: boolean) {
      state.isFetchingCustomer = isFetchingCustomer;
    },


    SET_CUSTOMER(state, customer: PrunedCustomer) {
      state.customer = customer;
    },
    UPDATE_CUSTOMER(state, changes: {[key: string]: any;}) {
      const combinedData = {
        ...state.customer,
        ...changes,
      };
      // @ts-ignore
      const name = formatFanName(combinedData);
      // @ts-ignore
      const formattedLocation = formatCustomerLocation(combinedData);
      // @ts-ignore
      state.customer = {
        ...state.customer,
        ...changes,
        name,
        formattedLocation,
      }
    },
    SET_HAS_FETCH_CUSTOMER_FAILED(state, hasFailed: boolean) {
      state.hasFetchCustomerFailed = hasFailed;
    },

    // Customer Tags
    RESET_CUSTOMER_TAGS(state) {
      state.fanTags = [];
    },
    SET_CUSTOMER_TAGS(state, tags: Tag[]) {
      // Note - sometimes fan_promoter_tags are not correctly removed, and this leads to blank tags appearing.
      // Until this issue is fully resolved, lets hide these tags from the UI.
      state.fanTags = clone(tags.filter(item => !!item.oid));
    },
    SET_IS_FETCHING_CUSTOMER_TAGS(state, isFetching: boolean) {
      state.isFetchingFanTags = isFetching;
    },
    REMOVE_FROM_CUSTOMER_TAGS(state, tagOid: number) {
      state.fanTags = state.fanTags.filter(tag => {
        return tag.oid !== tagOid;
      });
    },

    // Customer Activities
    RESET_CUSTOMER_ACTIVITY(state) {
      state.noMoreActivity = false;
      state.hasFetchCustomerFailed = false;
      state.fanActivity = [];
    },
    CONCAT_CUSTOMER_ACTIVITY(state, activityList: PrunedActivity[]) {
      state.fanActivity = clone(state.fanActivity.concat(activityList))
    },
    // Replace allows us to swap out activity lists in one operation, allowing a clean animated transition to occur
    REPLACE_CUSTOMER_ACTIVITY(state, activityList: PrunedActivity[]) {
      state.fanActivity = activityList;
    },
    SET_IS_NO_MORE_CUSTOMER_ACTIVITY(state, isNoMoreActivity: boolean) {
      state.noMoreActivity = isNoMoreActivity;
    },
    SET_IS_FETCHING_CUSTOMER_ACTIVITY(state, isFetchingActivity: boolean) {
      state.isFetchingActivity = isFetchingActivity;
    },
    SET_HAS_FETCH_CUSTOMER_ACTIVITY_FAILED(state, hasFailed: boolean) {
      state.hasFetchCustomerActivityFailed = hasFailed;
    },
    SET_LAST_ACTIVITY_TYPE(state, activityType:string) {
      state.lastActivityType = activityType;
    },

    // Customer Events
    RESET_CUSTOMER_EVENTS(state) {
      state.fanEvents = [];
      state.actionedEventOids = [];
      state.hasFetchCustomerEventsFailed = false;
    },
    CONCAT_CUSTOMER_EVENTS(state, eventList: AREvent[]) {
      state.fanEvents = clone(state.fanEvents.concat(eventList));
    },
    CONCAT_CUSTOMER_ACTIONED_EVENT_OIDS(state, eventOids: number[]) {
      state.actionedEventOids = clone(state.actionedEventOids.concat(eventOids));
    },
    SET_IS_FETCHING_CUSTOMER_EVENTS(state, isFetchingEvents: boolean) {
      state.isFetchingEvents = isFetchingEvents;
    },
    SET_HAS_FETCH_CUSTOMER_EVENTS_FAILED(state, hasFailed: boolean) {
      state.hasFetchCustomerEventsFailed = hasFailed;
    },

    // Customer Campaigns
    RESET_CUSTOMER_CAMPAIGNS(state) {
      state.fanCampaigns = [];
      state.actionedCampaignOids = [];
      state.hasFetchCustomerCampaignsFailed = false;
    },
    CONCAT_CUSTOMER_CAMPAIGNS(state, campaignList: Campaign[]) {
      state.fanCampaigns = clone(state.fanCampaigns.concat(campaignList));
    },
    CONCAT_CUSTOMER_ACTIONED_CAMPAIGN_OIDS(state, campaignOids: number[]) {
      state.actionedCampaignOids = clone(state.actionedCampaignOids.concat(campaignOids));
    },
    SET_IS_FETCHING_CUSTOMER_CAMPAIGNS(state, isFetchingCampaigns: boolean) {
      state.isFetchingCampaigns = isFetchingCampaigns;
    },
    SET_HAS_FETCH_CUSTOMER_CAMPAIGNS_FAILED(state, hasFailed: boolean) {
      state.hasFetchCustomerCampaignsFailed = hasFailed;
    },

    // Customer Purchase
    RESET_CUSTOMER_PURCHASES(state) {
      state.fanPurchases = [];
      state.noMorePurchases = false;
      state.hasFetchCustomerPurchasesFailed = false;
    },
    CONCAT_CUSTOMER_PURCHASES(state, purchasesList: PrunedPurchase[]) {
      state.fanPurchases = clone(state.fanPurchases.concat(purchasesList));
    },
    SET_IS_NO_MORE_CUSTOMER_PURCHASES(state, isNoMorePurchases: boolean) {
      state.noMorePurchases = isNoMorePurchases;
    },
    SET_IS_FETCHING_CUSTOMER_PURCHASES(state, isFetchingPurchases: boolean) {
      state.isFetchingPurchases = isFetchingPurchases;
    },
    SET_HAS_FETCH_CUSTOMER_PURCHASES_FAILED(state, hasFailed: boolean) {
      state.hasFetchCustomerPurchasesFailed = hasFailed;
    },

    // Customer Loyalty Memberships
    RESET_CUSTOMER_LOYALTY_MEMBERSHIPS(state) {
      state.fanLoyaltyMemberships = initialCustomerState().fanLoyaltyMemberships;
    },
    SET_CUSTOMER_LOYALTY_MEMBERSHIPS(state, fanLoyaltyMemberships: FanLoyaltyMembership[]) {
      state.fanLoyaltyMemberships = clone(fanLoyaltyMemberships);
    },
    SET_IS_FETCHING_CUSTOMER_LOYALTY_MEMBERSHIPS(state, isFetching: boolean) {
      state.isFetchingLoyaltyMemberships = isFetching;
    },
    RESET_CUSTOMER_LOYALTY_PROGRAM_TIERS_MAP(state) {
      state.loyaltyProgramTiersMap = initialCustomerState().loyaltyProgramTiersMap;
    },
    SET_CUSTOMER_LOYALTY_PROGRAM_TIERS_MAP(state, loyaltyProgramTiersMap: LoyaltyProgramTiersMap) {
      state.loyaltyProgramTiersMap = clone(loyaltyProgramTiersMap);
    },

    // Customer Loyalty Programs
    RESET_CUSTOMER_LOYALTY_PROGRAMS(state) {
      state.fanLoyaltyPrograms = initialCustomerState().fanLoyaltyPrograms;
    },
    SET_CUSTOMER_LOYALTY_PROGRAMS(state, fanLoyaltyPrograms: LoyaltyProgram[]) {
      state.fanLoyaltyPrograms = clone(fanLoyaltyPrograms);
    },
    SET_IS_FETCHING_CUSTOMER_LOYALTY_PROGRAMS(state, isFetching: boolean) {
      state.isFetchingLoyaltyPrograms = isFetching;
    },
  },
  getters: {
    customerFormattedFullName(state): string {
      if (!state.customer) return '';
      if (!state.customer.firstName && !state.customer.lastName) {
        return state.customer.emailAddress;
      }
      if (!state.customer.lastName) {
        return state.customer.firstName;
      }
      return `${state.customer.firstName} ${state.customer.lastName}`;
    },
    customerFormattedAge(state): string {
      if (!state.customer) return '';
      if (state.customer.dob) {
        const now = moment().utc();
        const dob = moment(state.customer.dob).utc();
        const difference = now.diff(dob, 'years');
        return `${difference} years old`
      }
      if (state.customer.age && state.customer.age > 0) {
        return `${state.customer.age} years old`
      }
      return '';
    },
    customerFormattedLocation(state): string {
      if (!state.customer) return '';
      let locationString = '';
      // @ts-ignore
      const relevantCountry = countryList.find(item => item.iso === state.customer.country);
      locationString += state.customer.city ? state.customer.city : '';
      if(state.customer.country && ['au', 'us'].indexOf(state.customer.country) > -1) {
        locationString += state.customer.state ? locationString.length > 0 ? `, ${state.customer.state.toUpperCase()}` : state.customer.state.toUpperCase() : '';
      } else {
        locationString += state.customer.state ? locationString.length > 0 ? `, ${state.customer.state.toUpperCase()}` : state.customer.state.toUpperCase() : '';
      }
      locationString += relevantCountry ? locationString.length > 0 ? `, ${relevantCountry.name}` : relevantCountry.name : '';
      return locationString;
    }
  },
};

export default customerModule;
