import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { CustomerState, LoyaltyProgramTiersMap } from './types';
import { formatFanName } from '@/store/modules/audience/utils';
import { formatActivity, formatCustomerAge, formatCustomerLocation, formatPurchases } from './utils';

export const customerActions: ActionTree<CustomerState, RootState> = {
  // -------------------
  // Fetches a single Customer
  // -------------------
  async FETCH_CUSTOMER(
    { state, rootState, commit },
    { fanOid = null },
  ) {
    if (state.isFetchingCustomer) return;

    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(fanOid)) return;
    try {
      commit('SET_IS_FETCHING_CUSTOMERS', true);

      const customer = await this.$api.customerProfile.fetch(promoterOid, fanOid);

      // Manually add "name" to Fan Object and reset their data
      const prunedCustomer: any = {
        ...customer,
        name: formatFanName(customer),
        formattedAge: formatCustomerAge(customer),
        formattedLocation: formatCustomerLocation(customer),
        fanActivity: [],
        fanPurchases: [],
        fanCampaigns: [],
        fanEvents: [],
      };

      commit('SET_CUSTOMER', prunedCustomer);

    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch fan' })
    } finally {
      commit('SET_IS_FETCHING_CUSTOMERS', false);
    }
  },

  /**
   * FETCH_CUSTOMER_TAGS
   */
  async FETCH_CUSTOMER_TAGS({ rootState, commit }, fanOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    let url = `/promoter/${promoterOid}/tag/${fanOid}/fan`;

    try {
      commit('SET_IS_FETCHING_CUSTOMER_TAGS', true);
      const { data } = await this.$axios.get(url, {
        params: {
          $filter: `fanOid=${fanOid} AND promoter_oid=${promoterOid}`,
        },
      });
      const tags = data.map((tag: any) => {
        return tag.promoterTag;
      })

      commit('SET_CUSTOMER_TAGS', tags);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_TAGS', false);
    }
  },

  // -------------------
  // Fetches the activity for a single customer
  // -------------------
  async FETCH_CUSTOMER_ACTIVITY(
    { state, rootState, commit },
    { top = 50, skip = 0, types = null, notTypes = null, append = false, orderby = "activityTime desc", fanOid = null },
  ) {
    if (state.isFetchingActivity) return;

    if (!rootState.auth.account) return;
    const { promoterOid } = rootState.auth.account;
    if (!state.customer) return;

    if (state.hasFetchCustomerActivityFailed) {
      console.error(`FETCH_CUSTOMER_ACTIVITY cancelled due to previous failed request.`);
      return;
    }

    try {
      commit('SET_IS_FETCHING_CUSTOMER_ACTIVITY', true);

      if (!append) commit('SET_IS_NO_MORE_CUSTOMER_ACTIVITY', false);

      let uri = `/promoter/${promoterOid}/fan-activity`;

      if (fanOid == null) {
        fanOid = state.customer.oid
      }

      let filterString = `fanOid=${fanOid}`;
      let notTypesFilter = null;
      if (notTypes && notTypes.length > 0) {
        const joinString = ` AND activityType != `;
        notTypesFilter = `activityType != ${notTypes.join(joinString)}`;
        filterString += ` AND ${notTypesFilter}`;
      }
      let typesFilter = null;
      if (types && types.length > 0) {
        const joinString = ` OR fanOid=${fanOid} AND activityType = `;
        typesFilter = `activityType = ${types.join(joinString)}`;
        filterString += ` AND ${typesFilter}`;
      }

      const { data } = await this.$axios.get(uri, {
        params: {
          $top: top,
          $count: true,
          $skip: skip,
          $orderby: orderby,
          $filter: filterString,
        }
      });

      const activityList = formatActivity(data.rows, state.customer);

      if (append) {
        commit('CONCAT_CUSTOMER_ACTIVITY', activityList);
      } else {
        commit('REPLACE_CUSTOMER_ACTIVITY', activityList);
      }

      if (state.fanActivity.length >= data.count) {
        commit('SET_IS_NO_MORE_CUSTOMER_ACTIVITY', true);
      }

    } catch (e) {
      console.error(e);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch fan activity' });
      commit('SET_HAS_FETCH_CUSTOMER_ACTIVITY_FAILED', true)
    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_ACTIVITY', false);
    }
  },

  // -------------------
  // Fetches the events for a single customer
  // We do this by explicitly fetching using event oids provided by customer
  // -------------------
  async FETCH_CUSTOMER_EVENTS(
    { state, rootState, commit },
    { searchString = null, append = false },
  ) {

    if (!state.customer) return;
    if (state.isFetchingEvents) return;
    if (state.hasFetchCustomerEventsFailed) {
      console.error(`FETCH_CUSTOMER_EVENTS cancelled due to previous failed request.`);
      return;
    }

    // We get all the event oids from customer, sort them by purchaseDate, filter out the ones which
    // exist in actionedEventOids and then return an array
    const unfetchedEventOidsOrdered = state.customer.events.map(event => {
      return {
        oid: event,
        date: state.customer && state.customer.purchaseDatePerEvent && state.customer.purchaseDatePerEvent[event] ? state.customer.purchaseDatePerEvent[event] : null,
      }
    }).sort((a, b) => {
      if (a.date && b.date && a.date > b.date) return -1;
      if (a.date && b.date && a.date < b.date) return 1;
      return 0;
    }).filter(event => !state.actionedEventOids.includes(event.oid)
    ).map(event => event.oid);


    const oidsToFetch = [];
    while (oidsToFetch.length < 10 && unfetchedEventOidsOrdered.length > 0) {
      oidsToFetch.push(unfetchedEventOidsOrdered.shift());
    }

    if (oidsToFetch.length < 0) return;
    let fetchedEvents = [];
    let error = false;

    try {
      commit('SET_IS_FETCHING_CUSTOMER_EVENTS', true);
      fetchedEvents = await this.dispatch('FETCH_EVENTS_BY_OID_AND_SEARCH', { oids: oidsToFetch, searchString }, { root: true });
      if (append) {
        commit('CONCAT_CUSTOMER_EVENTS', fetchedEvents);
      } else {
        await commit('RESET_CUSTOMER_EVENTS');
        commit('CONCAT_CUSTOMER_EVENTS', fetchedEvents);
      }
      commit('CONCAT_CUSTOMER_ACTIONED_EVENT_OIDS', oidsToFetch);

    } catch (e) {
      error = true;
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch fan events' });
      commit('SET_HAS_FETCH_CUSTOMER_EVENTS_FAILED', true);

    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_EVENTS', false);
      if (
        searchString &&
        fetchedEvents.length < 5 &&
        unfetchedEventOidsOrdered.length > 0 &&
        state.actionedEventOids.length < state.customer.events.length &&
        !error) {
        this.dispatch('FETCH_CUSTOMER_EVENTS', { searchString, append: true })
      }
    }
  },


  // -------------------
  // Fetches the campaigns for a single customer
  // We do this by explicitly fetching using campaign oids provided by customer
  // -------------------
  async FETCH_CUSTOMER_CAMPAIGNS(
    { state, rootState, commit },
    { searchString = null, append = false },
  ) {
    if (!state.customer) return;
    if (state.isFetchingCampaigns) return;
    if (state.hasFetchCustomerCampaignsFailed) {
      console.error(`FETCH_CUSTOMER_CAMPAIGNS cancelled due to previous failed request.`);
      return;
    }

    //  We get all the campaign oids from customer, sort them by purchaseDate, filter out the ones which
    // exist in actionedCampaignOids and then return an array
    const unfetchedCampaignOidsOrdered = state.customer.campaigns.map(campaign => {
      return {
        oid: campaign,
        date: state.customer && state.customer.registrationTimePerCampaign && state.customer.registrationTimePerCampaign[campaign] ? state.customer.registrationTimePerCampaign[campaign] : null,
      }
    }).sort((a, b) => {
      if (a.date && b.date && a.date > b.date) return -1;
      if (a.date && b.date && a.date < b.date) return 1;
      return 0;
    }).filter(campaign => !state.actionedCampaignOids.includes(campaign.oid)
    ).map(campaign => campaign.oid);


    const oidsToFetch = [];
    while (oidsToFetch.length < 10 && unfetchedCampaignOidsOrdered.length > 0) {
      oidsToFetch.push(unfetchedCampaignOidsOrdered.shift());
    }

    if (oidsToFetch.length < 0) return;
    let fetchedCampaigns = [];
    let error = false;

    try {
      commit('SET_IS_FETCHING_CUSTOMER_CAMPAIGNS', true);
      fetchedCampaigns = await this.dispatch('FETCH_CAMPAIGNS_BY_OID_AND_SEARCH', { oids: oidsToFetch, searchString }, { root: true });
      if (append) {
        commit('CONCAT_CUSTOMER_CAMPAIGNS', fetchedCampaigns);
      } else {
        await commit('RESET_CUSTOMER_CAMPAIGNS');
        commit('CONCAT_CUSTOMER_CAMPAIGNS', fetchedCampaigns);
      }
      commit('CONCAT_CUSTOMER_ACTIONED_CAMPAIGN_OIDS', oidsToFetch);

    } catch (e) {
      error = true;
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch fan campaigns' });
      commit('SET_HAS_FETCH_CUSTOMER_CAMPAIGNS_FAILED', true);

    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_CAMPAIGNS', false);
      if (
        searchString &&
        fetchedCampaigns.length < 5 &&
        unfetchedCampaignOidsOrdered.length > 0 &&
        state.actionedCampaignOids.length < state.customer.campaigns.length &&
        !error) {
        this.dispatch('FETCH_CUSTOMER_CAMPAIGNS', { searchString, append: true })
      }
    }
  },


  // -------------------
  // Fetches the purchases for a single customer
  // -------------------
  async FETCH_CUSTOMER_PURCHASES(
    { state, rootState, commit },
    { top = 50, append = false, searchString = null, orderby = "oid desc", fanOid = null },
  ) {
    if (state.isFetchingPurchases) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!state.customer) return;
    if (state.hasFetchCustomerPurchasesFailed) {
      console.error(`FETCH_CUSTOMER_PURCHASES cancelled due to previous failed request.`);
      return;
    }


    try {
      commit('SET_IS_FETCHING_CUSTOMER_PURCHASES', true);

      // let uri = `/promoter/${promoterOid}/fan-profile-ticket-sales`;
      let uri = `/promoter/${promoterOid}/fan-profile-ticket-sales`;
      if (fanOid == null) {
        fanOid = state.customer.oid
      }

      let filterString = `fanOid=${fanOid}`;
      let typesFilter = null;
      if (searchString) {

        typesFilter = ` AND event[name] ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND campaign[name] ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND campaign[type] ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND orderId ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND status ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND type ILIKE "%${searchString}%"`;
        typesFilter += ` OR fanOid=${fanOid} AND provider ILIKE "%${searchString}%"`;

        filterString += typesFilter;
      }

      const skip = append ? state.fanPurchases.length : 0;


      const { data } = await this.$axios.get(uri, {
        params: {
          $top: top,
          $count: true,
          $skip: skip,
          $orderby: orderby,
          $filter: filterString,
        }
      });

      const formattedPurchases = formatPurchases(data.rows);

      if (append) {
        commit('CONCAT_CUSTOMER_PURCHASES', formattedPurchases);
      } else {
        await commit('RESET_CUSTOMER_PURCHASES');
        commit('CONCAT_CUSTOMER_PURCHASES', formattedPurchases);
      }

      if (state.fanPurchases.length >= data.count) {
        commit('SET_IS_NO_MORE_CUSTOMER_PURCHASES', true);
      }

    } catch (e) {
      console.error(e);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch fan purchases' });
      commit('SET_HAS_FETCH_CUSTOMER_PURCHASES_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_PURCHASES', false);
    }

  },

  async FETCH_CUSTOMER_LOYALTY_MEMBERSHIPS(
    { state, rootState, commit },
    fanOid: number,
  ) {
    if (state.isFetchingLoyaltyMemberships) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_CUSTOMER_LOYALTY_MEMBERSHIPS', true);

      const fanLoyaltyMemberships = await this.$api.customerProfile.fetchFanLoyaltyMembership(promoterOid, fanOid);
      commit('SET_CUSTOMER_LOYALTY_MEMBERSHIPS', fanLoyaltyMemberships);

      if (fanLoyaltyMemberships.length > 0) {
        const loyaltyProgramTierOids = fanLoyaltyMemberships.map((item) => item.fanLoyaltyTier.loyaltyTierOid).filter(item => !!item);
        const loyaltyProgramTiers = await this.$api.customerProfile.fetchLoyaltyProgramTiersByOids(promoterOid, loyaltyProgramTierOids);
        const loyaltyProgramTiersMap: LoyaltyProgramTiersMap = {};
        loyaltyProgramTiers.forEach(tier => {
          loyaltyProgramTiersMap[tier.oid] = tier;
        });
        commit('SET_CUSTOMER_LOYALTY_PROGRAM_TIERS_MAP', loyaltyProgramTiersMap);
      }
    } catch (e) {
      console.error(e);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch active memberships' });
    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_LOYALTY_MEMBERSHIPS', false);
    }

  },

  async FETCH_CUSTOMER_LOYALTY_PROGRAMS(
    { state, rootState, commit }
  ) {
    if (state.isFetchingLoyaltyPrograms) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_CUSTOMER_LOYALTY_PROGRAMS', true);

      const loyaltyPrograms = await this.$api.customerProfile.fetchPromoterIntegrationLoyaltyPrograms(promoterOid);
      commit('SET_CUSTOMER_LOYALTY_PROGRAMS', loyaltyPrograms);
    } catch (e) {
      console.error(e);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch active loyalty programs' });
    } finally {
      commit('SET_IS_FETCHING_CUSTOMER_LOYALTY_PROGRAMS', false);
    }

  },



};
