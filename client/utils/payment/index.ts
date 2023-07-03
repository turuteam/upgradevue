import { convertToKebabCase } from '@/utils/helpers/';

// Checks to see whether an addon is included in a base plan, and if so, what quantity
// Returns an int
export function getFreeAddOnQuantity({ addonPlan, basePlan }: { addonPlan: PaymentPlan, basePlan: PaymentPlan }): number {
  if (!basePlan.additionalInfo) return 0;
  if (!basePlan.additionalInfo.metaData) return 0;

  const planIdsIncluded = Object.fromEntries(
    Object.entries((basePlan.additionalInfo.metaData.includedSubscriptions || {})).map(([key, value]) =>
      // Modify key here
      [`${convertToKebabCase(key)}`, value]
    )
  );

  const childOf = addonPlan.additionalInfo && addonPlan.additionalInfo.metaData && addonPlan.additionalInfo.metaData.childOf ? addonPlan.additionalInfo.metaData.childOf : false;
  const addonId = childOf || addonPlan.puid;
  if (!addonId && !childOf) return 0;
  if (planIdsIncluded[addonId]) return planIdsIncluded[addonId];

  return 0;
}

// Checks to see whether the current basePlan allows for the current addon
// Returns a bool
export function basePlanAllowsAddon({ addonPlan, basePlan }: { addonPlan: PaymentPlan, basePlan: PaymentPlan }): boolean {
  if (!basePlan) return false;
  if (!basePlan.additionalInfo) return false;
  if (!basePlan.additionalInfo.metaData) return false;
  if (!basePlan.additionalInfo.metaData.allowedSubscriptions) return false;
  const allowedSubscriptions = basePlan.additionalInfo.metaData.allowedSubscriptions;

  const childOf = addonPlan.additionalInfo && addonPlan.additionalInfo.metaData && addonPlan.additionalInfo.metaData.childOf ? addonPlan.additionalInfo.metaData.childOf : false;
  const addonId = childOf || addonPlan.puid;

  return allowedSubscriptions.indexOf(addonId) > -1;
}

export const getBasePaymentPlanTier = ({ paymentPlan, planQuantity }: { paymentPlan: PaymentPlan, planQuantity: number }): PaymentPlanTier | {} => {
  if (!paymentPlan.additionalInfo.tiers) {
    return {};
  }

  const tierIndex = paymentPlan.additionalInfo.tiers.findIndex(({ startingUnit, endingUnit }) => {
    if ((!planQuantity || planQuantity === 1) && startingUnit === 1) {
      return true;
    }

    if (endingUnit === undefined) {
      return true;
    }
    return planQuantity > startingUnit && planQuantity <= endingUnit;
  });

  return paymentPlan.additionalInfo.tiers[tierIndex] || {};
};

export const getMinimumRequiredPlanTierByNumberOfContacts = ({ paymentPlan, numberOfContacts }: { paymentPlan: PaymentPlan, numberOfContacts: number }): PaymentPlanTier | null => {
  if (!paymentPlan.additionalInfo.tiers) {
    return null;
  }
  const targetTier = paymentPlan.additionalInfo.tiers.find(tier => !tier.endingUnit || tier.endingUnit > numberOfContacts);
  return targetTier ? targetTier : paymentPlan.additionalInfo.tiers[0];
};

export const getRelevantSubscriptionsByPaymentSource = ({ paymentSubscriptions, paymentSource }: { paymentSubscriptions: PaymentSubscription[], paymentSource: PaymentSource }): PaymentSubscription[] => {
  return paymentSubscriptions.filter(paymentSubscription => paymentSubscription.ppaymentSourceId === paymentSource.puid);
};
