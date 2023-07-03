import { clone } from '@/utils/helpers';
import { PrunedPaymentPlan } from './types';

// The Payments UI only allows for a small subset of total Chargebee plans to be self-serviced by users.
// If the user has subscribed to a plan other than one in this list, we want to merge in the subscribed plan's data on top of the self-service plan (then set it to read only)
// Basically, if the plan the user is on has been set by sales, then it becomes read only
export const mergePlansAndSubscriptions = (
  paymentPlans: PaymentPlan[],
  paymentSubscriptions: PaymentSubscription[]
) => {
  // Make srue you clone new object, otherwie any changes done to plans & subscriptions will affect others
  const clonedPaymentPlans: PaymentPlan[] = clone(paymentPlans);
  const clonedPaymentSubscriptions: PaymentSubscription[] = clone(paymentSubscriptions);

  const paymentPlanPuids = clonedPaymentPlans.map(plan => plan.puid);
  const completePaymentPlans = [...clonedPaymentPlans];
  const basePaymentPlans: PrunedPaymentPlan[] = [];
  const addOnPaymentPlans: PrunedPaymentPlan[] = [];
  let basePaymentSubscription = null;
  let addOnPaymentSubscriptions = [];
  let plansIncludedInSubscription: string[] = []; // Sometimes, subscriptions will also have included plans (because keeping them in one place is too easy!)

  // Fill the missing plan to "completePaymentPlans"
  clonedPaymentSubscriptions.forEach(subscription => {
    // If your parent plan is not in the parent plan list, let's make a fake parent plan
    if (subscription.paymentPlan.additionalInfo?.metaData?.childOf && paymentPlanPuids.indexOf(subscription.paymentPlan.additionalInfo.metaData.childOf) === -1) {
      const fakeParentPaymentPlan = clone(subscription.paymentPlan);
      fakeParentPaymentPlan.featureIds = [];
      fakeParentPaymentPlan.additionalInfo.tiers = [];
      fakeParentPaymentPlan.additionalInfo.metaData.presentation = {};
      // Don't forget to replace "puid" with your expected parent plan puid
      fakeParentPaymentPlan.puid = fakeParentPaymentPlan.additionalInfo.metaData.childOf;
      fakeParentPaymentPlan.additionalInfo.metaData.childOf = null;
      completePaymentPlans.push(fakeParentPaymentPlan);
    }
    if (subscription.additionalInfo?.metaData?.includedPlans && subscription.additionalInfo.metaData.includedPlans.length > 0) {
      plansIncludedInSubscription = plansIncludedInSubscription.concat(subscription.additionalInfo.metaData.includedPlans);
    }
  });

  // Step one - sparate "completePaymentPlans" and push them into "basePaymentPlans" and "addOnPaymentPlans"
  completePaymentPlans
    .forEach(plan => {
      let newPlan: PrunedPaymentPlan = { ...plan, paymentSubscriptions: [] };

      if (newPlan.additionalInfo?.metaData?.presentation && typeof newPlan.additionalInfo.metaData.presentation.hidePrice === 'undefined') {
        newPlan.additionalInfo.metaData.presentation.hidePrice = !!newPlan.additionalInfo.metaData.presentation.contactSales; // If the price is negotiable, then hide it on purchase
      }

      newPlan.paymentSubscriptions = clonedPaymentSubscriptions.filter(sub => {
        return sub.additionalInfo?.planId === plan.puid || sub.paymentPlan.additionalInfo?.metaData?.childOf === plan.puid;
      });

      // Split plans into base plans and addon plans
      if (newPlan.type === 'base') {
        basePaymentPlans.push(newPlan);
      } else if (newPlan.type === 'add-on' || newPlan.type === 'base-or-add-on') {
        addOnPaymentPlans.push(newPlan);
      }
    });


  // Step two - override base plan metadata with custom plan metadata IF custom plan exists and has a childOf matching the plan's planId
  // This will only run if a subscription is a custom plan.
  clonedPaymentSubscriptions.filter( item => {
    return item.paymentPlan.additionalInfo?.metaData?.childOf;
  }).forEach(item => {
    const parentId = item.paymentPlan.additionalInfo?.metaData?.childOf;
    const parentBasePlan = basePaymentPlans.find(item => item.puid === parentId);
    const parentAddOnPlan = addOnPaymentPlans.find(item => item.puid === parentId);
    const paymentPlan = item.paymentPlan;

    if (parentBasePlan) {
      parentBasePlan.additionalInfo.metaData.childOf = parentId;
      parentBasePlan.additionalInfo.metaData.presentation.contactSales = true;
      parentBasePlan.additionalInfo.name = paymentPlan.name ? paymentPlan.name : parentBasePlan.additionalInfo.name;
      parentBasePlan.additionalInfo.description = paymentPlan.description ? paymentPlan.description : parentBasePlan.additionalInfo.description;

      // If the custom plan is missing allows or included subscriptions, then lets copy them from the parent
      if (!paymentPlan.additionalInfo?.metaData?.allowedSubscriptions || paymentPlan.additionalInfo?.metaData?.allowedSubscriptions.length === 0) {
        paymentPlan.additionalInfo.metaData.allowedSubscriptions = parentBasePlan.additionalInfo.metaData.allowedSubscriptions;
      }
      if (!paymentPlan.additionalInfo?.metaData?.includedSubscriptions) {
        paymentPlan.additionalInfo.metaData.includedSubscriptions = parentBasePlan.additionalInfo.metaData.includedSubscriptions || {};
      }

      // If the subscription includes plans separate to the plan object, then add them in too
      if (plansIncludedInSubscription.length > 0) {
        plansIncludedInSubscription.forEach( item => {
          if (!paymentPlan.additionalInfo?.metaData?.includedSubscriptions[item]) paymentPlan.additionalInfo.metaData.includedSubscriptions[item] = 1;
        });
      }
    } else if (parentAddOnPlan) {
      parentAddOnPlan.additionalInfo.metaData.childOf = parentId;
      parentAddOnPlan.additionalInfo.metaData.presentation.contactSales = true;
      parentAddOnPlan.additionalInfo.name = paymentPlan.name ? paymentPlan.name : parentAddOnPlan.additionalInfo.name;
      parentAddOnPlan.additionalInfo.description = paymentPlan.description ? paymentPlan.description : parentAddOnPlan.additionalInfo.description;
    }
  });

  // Step three - find all active subscriptions
  basePaymentSubscription = clonedPaymentSubscriptions.find( plan => {
    return plan.paymentPlan && plan.paymentPlan.type === 'base';
  }) || null;
  addOnPaymentSubscriptions = clonedPaymentSubscriptions.filter( plan => {
    return plan.paymentPlan && plan.paymentPlan.type  === 'add-on';
  });


  // Sort the plans based on config settings. Each item in config settings should contain a priority key which dictates order of cards in UI.
  function prioritySort(a: PaymentPlan, b: PaymentPlan) {
    const aPaymentPlanPriority = a?.additionalInfo?.metaData?.presentation?.priority ? a.additionalInfo.metaData.presentation.priority : null;
    const bPaymentPlanPriority = b?.additionalInfo?.metaData?.presentation?.priority ? b.additionalInfo.metaData.presentation.priority : null;
    if(aPaymentPlanPriority === null && bPaymentPlanPriority === null) return 0;
    if(aPaymentPlanPriority === null) return -1;
    if(bPaymentPlanPriority === null) return 1;

    if(aPaymentPlanPriority > bPaymentPlanPriority) {
      return 1;
    } else if(aPaymentPlanPriority < bPaymentPlanPriority) {
      return -1;
    }
    return 0;
  }

  if (addOnPaymentPlans) addOnPaymentPlans.sort((a,b) => prioritySort(a, b));
  if (basePaymentPlans) basePaymentPlans.sort((a,b) => prioritySort(a, b));
  if (addOnPaymentSubscriptions) addOnPaymentSubscriptions.sort((a, b) => prioritySort(a.paymentPlan, b.paymentPlan));

  return {
    basePaymentPlans,
    addOnPaymentPlans,
    basePaymentSubscription,
    addOnPaymentSubscriptions,
  };
};

// We do have some card stored in old format, we have to filter them out
export const filterValidPaymentSources = (paymentSources: PaymentSource[]): PaymentSource[] => {
  return paymentSources.filter(paymentSource => !!paymentSource.additionalInfo.card);
};
