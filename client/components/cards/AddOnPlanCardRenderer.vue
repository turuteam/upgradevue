<template>
    <am2-card-container class="add-on-option-card">
      <am2-change-payment-source-modal
        :is-open="displayChangePaymentSourceModal"
        :payment-plan="paymentPlan"
        :payment-source-puid="defaultPaymentSourcePuid"
        :payment-subscriptions="paymentPlan.paymentSubscriptions"
        @change="handlePaymentSourceChange"
        @cancel="handlePaymentSourceCancel"
      />
      <am2-purchase-sms-credit-modal
        :is-open="displayPurchaseSmsCreditModal"
        :payment-plan="paymentPlan"
        :payment-source-puid="defaultPaymentSourcePuid"
        :payment-subscription="paymentPlan.paymentSubscriptions[0]"
        @cancel="handlePurchaseSmsCreditCancel"
        @purchase="handleSmsCreditPurchase"
      />
      <am2-manage-facebook-page-subscriptions-modal
        v-if="isFacebookMessengerPlan"
        :is-open="displayManageFacebookPageSubscriptionsModal"
        :payment-plan="paymentPlan"
        :included-subscriptions-quantity="freeAddOnQuantity"
        :default-payment-source-puid="defaultPaymentSourcePuid"
        @paymentSubscriptionsUpdate="$emit('subscriptionStateUpdate')"
        @close="displayManageFacebookPageSubscriptionsModal = false"
      />
      <am2-direct-purchase-modal
        :is-show="displayDirectPurchaseModal"
        :payment-plan="paymentPlan"
        :payment-source-puid="defaultPaymentSourcePuid"
        :plan-quantity="planQuantifyForDirectPurchaseModal"
        @purchase="handleDirectPurchase"
        @cancel="displayDirectPurchaseModal = false"
      />
      <div :class="['left-top-fix-section', `${size}-size`]">
        <am2-tag
          v-if="atLeastOneSubscriptionIsNotRenewing"
          type="red"
          shape="rectangle"
          class="state-tag"
          :text="notRenewingText"
        />
        <am2-tag
          v-if="atLeastOneSubscriptionIsRenewing && !campaignCard"
          type="green"
          shape="rectangle"
          class="state-tag"
          :text="purchasedText"
        />
        <am2-tag
          v-if="isIncludedInBasePlan"
          type="green"
          shape="rectangle"
          class="state-tag"
          :text="freeAddOnQuantityText"
        />
      </div>
      <am2-icon-button-dropdown
        v-if="displayDropdown"
        :items="actionItems"
        :dropdown-style="{
          width: '200px',
        }"
        class="menu-dropdown"
        @select="handleActionSelect"
      />
      <div :class="['upper-section', `${size}-size`]">
        <ar-icon
          v-bind="planIconProps"
        />
        <ar-text
          class="title"
          size="sm"
          weight="bold"
          align="center"
          multiple-lines
          :text="planTitle"
        />
        <ar-text
          class="description"
          size="xs"
          :text="planDescription"
          align="center"
          multiple-lines
          line-height="25px"
        />
      </div>
      <ar-divider />
      <div :class="['bottom-section', `${size}-size`]">
        <div class="price-section">
          <div
            v-if="finalPriceCopy"
            class="price-text"
          >
            <ar-text
              v-if="priceIsNotCertain"
              size="xs"
              text="from"
              :style="{
                color: $arStyle.color.purple500,
              }"
            />
            <ar-text
              size="md"
              :text="finalPriceCopy"
              :style="{
                color: $arStyle.color.purple500,
              }"
              :class="priceIsNotCertain ? 'u-margin-left-1' : null"
            />
            <ar-text
              size="xs"
              :text="priceCurrencyCode"
              :style="{
                color: $arStyle.color.purple500,
              }"
              class="u-margin-left-1"
            />
          </div>
          <ar-text
            class="price-model-description"
            size="xxxs"
            :text="pricingModelDescription"
            multiple-lines
          />
        </div>
        <div class="bottom-buttons-section">
          <ar-simple-button
            v-if="priceIsNotCertain"
            text="Contact Sales"
            :style="{
              height: '40px',
            }"
            @click="handleContactSalesClick"
          />
          <am2-lock-simple-button
            v-else-if="isPurchaseButtonLocked"
            shape="rounded-rectangle"
            type="grey"
            text="Purchase"
            :style="{
              height: '40px',
            }"
            v-tooltip.top="{
              content: reasonForLockingPurchaseButtonLock,
            }"
          />
          <ar-simple-button
            v-else-if="isAllSubscriptionsNonRenewing"
            text="Renew"
            outlined
            :loading="isUndoingPaymentSubscriptionCancellations"
            :style="{
              height: '40px',
            }"
            @click="handleRenewClick"
          />
          <ar-simple-button
            v-else-if="!hasAnyPaymentSubscription && !isIncludedInBasePlan"
            text="Purchase"
            :style="{
              height: '40px',
            }"
            @click="handlePurchaseButtonClick"
          />
          <ar-simple-button
            v-else-if="isPlanUpdatable"
            outlined
            :text="updateSubscriptionButtonText"
            :style="{
              height: '40px',
            }"
            @click="handlePurchaseButtonClick"
          />
        </div>
      </div>
    </am2-card-container>
  </template>
  
  <script>
  import moment from 'moment';
  import accounting from 'accounting';
  import { hexToRGBA } from '@/utils/helpers/';
  import { getFreeAddOnQuantity, basePlanAllowsAddon, getBasePaymentPlanTier } from '@/utils/payment/';
  import { mapActions, mapState } from 'vuex';
  
  export default {
    name: 'AddOnOptionCard',
    props: {
      paymentPlan: {
        type: Object,
        default: () => ({}),
      },
      primaryPaymentSource: {
        type: Object,
        default: null,
      },
      baseSubscription: {
        type: Object,
        default: null,
      },
      size: {
        type: String,
        default: 'regular',
        validator: (value) => ['regular', 'small'].indexOf(value) > -1,
      },
    },
    data() {
      return {
        displayChangePaymentSourceModal: false,
        displayPurchaseSmsCreditModal: false,
        displayDirectPurchaseModal: false,
        isDeletingPaymentPlans: false,
        displayManageFacebookPageSubscriptionsModal: false,
      };
    },
    computed: {
      ...mapState({
        undoSubscriptionCancellationStatusMap: state => state.payment.undoSubscriptionCancellationStatusMap,
      }),
      isUndoingPaymentSubscriptionCancellations() {
        const paymentSubscriptionOids = this.paymentPlan.paymentSubscriptions.map(paymentSubscription => {
          return paymentSubscription.oid;
        });
        return paymentSubscriptionOids.some(oid => this.undoSubscriptionCancellationStatusMap[oid]);
      },
      planIconProps() {
        return {
          name: this.paymentPlan.additionalInfo?.metaData?.presentation?.iconName || 'audience',
          color: this.$arStyle.color[this.paymentPlan.additionalInfo?.metaData?.presentation?.iconName] || this.$arStyle.color.purple500,
          width: '30px',
          height: '30px',
          wrapperStyle: {
            display: 'inline-flex',
            alignItem: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            border: `1px solid ${this.$arStyle.color.skyBlueGrey400}`,
            boxShadow: `0 0 15px 0 ${hexToRGBA(this.$arStyle.color.blueGrey800, 0.1)}`,
            borderRadius: '50%',
          },
        };
      },
      actionItems() {
        return [
          {
            name: 'Change payment method',
            key: 'changePaymentMethod',
          },
          {
            name: 'Cancel',
            key: 'cancel',
            typography: {
              style: {
                color: this.$arStyle.color.red500,
              },
            },
          },
        ];
      },
      notRenewingText() {
        const numberOfNotRenewing = this.paymentPlan.paymentSubscriptions.filter(item => item.providerStatus === 'non_renewing').length;
        return this.paymentPlan.paymentSubscriptions.length > 1 ? `${numberOfNotRenewing} not renewing` : 'Not renewing';
      },
  
      purchasedText() {
        const numberOfPurchased = this.paymentPlan.paymentSubscriptions.filter((item => item.providerStatus === 'active')).length;
        return this.paymentPlan.paymentSubscriptions.length > 1 ? `${numberOfPurchased} purchased` : 'Purchased';
      },
      // Is subscription included as part of base plan?
      freeAddOnQuantity() {
        if (!this.baseSubscription) {
          return 0;
        }
        return getFreeAddOnQuantity({ addonPlan: this.paymentPlan, basePlan: this.baseSubscription.paymentPlan });
      },
      freeAddOnQuantityText() {
        const includedQuantity = this.freeAddOnQuantity;
        return includedQuantity > 1 ? `${includedQuantity} included` : 'Included';
      },
      isIncludedInBasePlan() {
        return this.freeAddOnQuantity > 0;
      },
      hasAnyPaymentSubscription() {
        return this.paymentPlan.paymentSubscriptions.length > 0;
      },
      displayDropdown() {
        // If this plan is custom to one of our standard plan
        if (!!this.paymentPlan.additionalInfo?.metaData?.childOf || !this.paymentPlan.additionalInfo?.metaData?.clientVisible) {
          return false;
        }
        return this.atLeastOneSubscriptionIsRenewing;
      },
      isPurchaseButtonLocked() {
        // This kind of plan can be regared as a base plan, so it can be purchased anytime
        if (this.paymentPlan.additionalInfo?.metaData?.type === 'base-or-add-on') {
          return false;
        }
  
        // You got no base subscription, it's not allowed, sorry
        if (!this.baseSubscription) {
          return true;
        }
  
        // Okay, let's check if your basePlan allows this addOnPlan
        return !basePlanAllowsAddon({
          basePlan: this.baseSubscription.paymentPlan,
          addonPlan: this.paymentPlan,
        });
      },
      isAllSubscriptionsNonRenewing() {
        // If you don't have any subscriptions, of course it's false
        if (!this.hasAnyPaymentSubscription) {
          return false;
        }
        // If all subscriptions are non renewing, show renew button
        return this.paymentPlan.paymentSubscriptions.filter(item => item.providerStatus === 'non_renewing').length === this.paymentPlan.paymentSubscriptions.length;
      },
      isFacebookMessengerPlan() {
        return this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'facebook-pages';
      },
      isPlanUpdatable() {
        // Only messenger and sms subscription can be updated after purchase
        return this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'facebook-pages'
          || this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'sms-credit';
      },
      updateSubscriptionButtonText() {
        switch (this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction) {
          case 'facebook-pages':
            return 'Manage Pages';
          case 'sms-credit':
            return 'Add Credits';
          case 'default':
            // Default purchase is not able to be updated
            return null;
          default:
            return null;
        }
      },
      reasonForLockingPurchaseButtonLock() {
        return this.paymentPlan.additionalInfo?.metaData?.presentation?.disabledTooltipText;
      },
      defaultPaymentSourcePuid() {
        let defaultPaymentSourcePuid = null;
        if (this.hasAnyPaymentSubscription) {
          defaultPaymentSourcePuid = this.paymentPlan.paymentSubscriptions[0].additionalInfo.paymentSourceId;
        } else {
          defaultPaymentSourcePuid = this.primaryPaymentSource ? this.primaryPaymentSource.puid : null;
        }
        return defaultPaymentSourcePuid;
      },
      planTitle() {
        return this.paymentPlan.additionalInfo.invoiceName || this.paymentPlan.additionalInfo.name;
      },
      planDescription() {
        return this.paymentPlan.additionalInfo.description;
      },
      paymentSubscriptionPriceCopy() {
        return this.paymentPlan.paymentSubscriptions.filter(item => item.providerStatus === 'active').reduce((sum, item) => {
          return sum + (item.additionalInfo.planAmount || item.additionalInfo.mrr * 12) / 100;
        }, 0);
      },
      paymentPlanPriceCopy() {
        if (this.paymentPlan.additionalInfo?.metaData?.presentation?.contactSales) {
          return this.paymentPlan.additionalInfo?.metaData?.presentation?.contactSalesPrice / 100;
        }
        if (this.paymentPlan.additionalInfo.metaData?.type === 'base-or-add-on') {
          // If if is "base-or-add-on"
          if (this.baseSubscription) {
            // The price will be depending on planQuantity of base plan subscription if it exists
            return getBasePaymentPlanTier({
              paymentPlan: this.paymentPlan,
              planQuantity: this.baseSubscription.quantity,
            }).price / 100;
          } else {
            // If not, display least price
            return this.paymentPlan.additionalInfo.tiers[0].price / 100;
          }
        } else {
          // If it's just pure add-on, get price from plan
          return this.paymentPlan.additionalInfo.price / 100
        }
      },
      finalPriceCopy() {
        // TODO ======  Remove the below once SMS Addon Card functionality is finalised! ======
        if (this.paymentPlan && this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'sms-credit') return null;
        // TODO ======  Remove the above once SMS Addon Card functionality is finalised! ======
  
        // Some plans will be marked as 'hide-price' when they have a subscription
        if (this.paymentPlan && this.paymentPlan.additionalInfo?.metaData?.presentation?.hidePrice && this.hasAnyPaymentSubscription) return null;
  
        // If the user is paying a subscription, get the price they pay for this subscription
  
        let finalyCopy;
        if (this.hasAnyPaymentSubscription && this.atLeastOneSubscriptionIsRenewing) {
          finalyCopy = this.paymentSubscriptionPriceCopy;
        } else {
          finalyCopy = this.paymentPlanPriceCopy;
        }
        return accounting.formatMoney(finalyCopy, null, 0);
      },
      priceIsNotCertain() {
        // You purchased, so the price is certain now
        if (this.hasAnyPaymentSubscription) {
          return false;
        }
  
        // Some of our legacy plans dont include audience limit, so we have to show a "From" value
        if (this.paymentPlan.additionalInfo.metaData?.type === 'base-or-add-on' && this.baseSubscription && (this.baseSubscription.quantity === 1 || !this.baseSubscription.quantity)) {
          return true;
        }
  
        // If user needs to contact sales, lets have a "from"
        return this.paymentPlan.additionalInfo?.metaData?.presentation?.contactSales;
      },
      planQuantifyForDirectPurchaseModal() {
        let planQuantity = null;
        if (this.paymentPlan.additionalInfo.metaData?.type === 'base-or-add-on' && this.baseSubscription) {
          planQuantity = this.baseSubscription.quantity;
        } else if (this.paymentPlan.additionalInfo.pricingModel === 'flat_fee') {
          planQuantity = null
        } else {
          // Currently there's no else
        }
        return planQuantity;
      },
      priceCurrencyCode() {
        if (this.hasAnyPaymentSubscription) {
          return this.paymentPlan.paymentSubscriptions[0].additionalInfo.currencyCode;
        } else {
          return this.paymentPlan.currency;
        }
      },
      pricingModelDescription() {
        let template;
        // TODO - This solution fixes the "Per year per Facebook Page" bug. We might need a better solution though.
        if (this.paymentPlan.paymentSubscriptions.length > 1 && this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'facebook-pages') {
          template = 'Per year';
        } else {
          template = this.paymentPlan.additionalInfo?.metaData?.presentation?.pricingModelDescription || '';
        }
  
        let contactsLimit = '';
        if (this.paymentPlan.additionalInfo.metaData?.type === 'base-or-add-on') {
          if (this.hasAnyPaymentSubscription) {
            contactsLimit = this.paymentPlan.paymentSubscriptions[0].additionalInfo.planQuantity;
          } else if (this.baseSubscription) {
            if (this.baseSubscription.quantity === 1 || !this.baseSubscription.quantity) return 'Per year'; // Special case for legacy plans which didn't include an audience limit
            contactsLimit = this.baseSubscription.additionalInfo.planQuantity;
          } else {
            contactsLimit = this.paymentPlan.additionalInfo.tiers[0].endingUnit;
          }
        }
  
        if (template.includes("Per year up")) {
          template = template.replace("Per year up", "Per year, up")
        }
  
        return template.replace(/{{contactsLimit}}/g, `${accounting.formatNumber(contactsLimit)}`)
      },
      atLeastOneSubscriptionIsNotRenewing() {
        return this.paymentPlan.paymentSubscriptions.some(item => item.providerStatus === 'non_renewing');
      },
      atLeastOneSubscriptionIsRenewing() {
        return this.paymentPlan.paymentSubscriptions.some(item => item.providerStatus === 'active');
      },
      campaignCard() {
          return this.paymentPlan.name === "Campaigns"
      }
    },
  
    methods: {
      ...mapActions([
        'CREATE_PAYMENT_SUBSCRIPTION',
        'payment/CANCEL_PAYMENT_SUBSCRIPTIONS',
        'payment/UNDO_PAYMENT_SUBSCRIPTION_CANCELLATIONS',
        'OPEN_CANCELLATION_MODAL',
      ]),
      async handlePaymentSubscriptionsDelete({ reason, paymentSubscriptionOids }) {
        const succeed = await this['payment/CANCEL_PAYMENT_SUBSCRIPTIONS']({
          oids: paymentSubscriptionOids,
          reason,
        })
  
        if (succeed) {
          this.$emit('subscriptionStateUpdate');
        }
      },
      handlePurchaseSmsCreditCancel() {
        this.displayPurchaseSmsCreditModal = false;
      },
      handleSmsCreditPurchase() {
        this.displayPurchaseSmsCreditModal = false;
          this.$emit('subscriptionStateUpdate');
      },
      async handleManageFacebookPagesClick() {
        this.displayManageFacebookPageSubscriptionsModal = true;
      },
      openContactSalesMail() {
        window.open('https://audiencerepublic.com/contact-us?type=organizer');
      },
      handleDirectPurchase() {
        this.$emit('subscriptionStateUpdate');
      },
      goSubscribeAddOnAsBasePlan() {
        this.$router.push({
          path: `/plans/${this.paymentPlan.oid}/subscribe/`,
        });
      },
      async handleRenewClick() {
        const paymentSubscriptionOids = this.paymentPlan.paymentSubscriptions.map(paymentSubscription => {
          return paymentSubscription.oid;
        });
        const succeed = await this['payment/UNDO_PAYMENT_SUBSCRIPTION_CANCELLATIONS'](paymentSubscriptionOids);
        if (succeed) {
          this.$emit('subscriptionStateUpdate');
        }
      },
      handleCancelSubscriptionClick() {
        if (this.paymentPlan.paymentSubscriptions.length === 1) {
          // If you only have one subscription to cancel
          this.OPEN_CANCELLATION_MODAL({
            title: `Are you sure you want to cancel ${this.planTitle}?`,
            messageHtmlBefore: `If you proceed, you'll still be able to use ${this.planTitle} until <strong>${moment(this.paymentPlan.paymentSubscriptions[0].additionalInfo.currentTermEnd * 1000).local().format('dddd MMMM Do, YYYY')}</strong>.`,
            messageHtmlAfter: `After this you'll no longer have access, and you will not be billed again for ${this.planTitle}, unless you choose to re-subscribe.`,
            showCancellationReasonTextarea: false,
            confirmButtonProps: {
              text: `Cancel ${this.planTitle}`,
              type: 'red',
              style: {
                width: 'auto',
                borderRadius: '7px',
              },
            },
            asyncCompleteFunction: async () => {
              await this.handlePaymentSubscriptionsDelete({
                paymentSubscriptionOids: this.paymentPlan.paymentSubscriptions.map(({ oid }) => oid),
              });
            },
          });
        }
  
        // Unfortunately, we have to specificly do that
        if (this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction === 'facebook-pages') {
          const featureSelection = this.paymentPlan.paymentSubscriptions.filter(item => item.providerStatus === 'active').map(item => {
            const termEnd = moment(item.additionalInfo.currentTermEnd * 1000).local().format('MM/DD/YY');
            return {
              value: item.oid,
              name: item.meta ? item.meta.name : "",
              image: item.meta ? item.meta.profileImageUrl : null,
              expiry: termEnd,
            };
          });
          // If you only have one subscription to cancel
          this.OPEN_CANCELLATION_MODAL({
            title: `Which Facebook Pages do you want to cancel?`,
            messageHtmlBefore: null,
            messageHtmlAfter: 'If you proceed, you\'ll still be able to send messages via Facebook Messenger until the <strong>date shown above</strong>.<br/><br/>After this you\'ll no longer have access, and you will not be billed again for the Page, unless you choose to purchase again.',
            showCancellationReasonTextarea: false,
            confirmButtonProps: {
              text: `Cancel ${this.planTitle}`,
            },
            featureSelection,
            asyncCompleteFunction: async ({ items }) => {
              await this.handlePaymentSubscriptionsDelete({
                paymentSubscriptionOids: items.map(({ value }) => value),
              });
            },
          });
        }
      },
      handlePaymentSourceChange() {
        this.displayChangePaymentSourceModal = false;
        this.$emit('subscriptionStateUpdate');
      },
      handlePaymentSourceCancel() {
        this.displayChangePaymentSourceModal = false;
      },
      async handleActionSelect(item) {
        if (item.key === 'changePaymentMethod') {
          this.displayChangePaymentSourceModal = true;
        } else if (item.key === 'cancel') {
          this.handleCancelSubscriptionClick();
        }
      },
      handleContactSalesClick() {
        this.openContactSalesMail();
      },
      handlePurchaseButtonClick() {
        if (this.paymentPlan.type === 'base-or-add-on' && !this.baseSubscription) {
          // When you have no base plan, this kind of add on plan is a base plan
          this.goSubscribeAddOnAsBasePlan();
          return;
        }
  
        switch (this.paymentPlan.additionalInfo?.metaData?.presentation?.purchaseAction) {
          case "sms-credit":
            this.displayPurchaseSmsCreditModal = true;
            break;
          case "facebook-pages":
            this.handleManageFacebookPagesClick();
            break;
          case "default":
            this.displayDirectPurchaseModal = true;
            break;
          default:
            break;
        }
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .add-on-option-card {
    position: relative;
  
    .left-top-fix-section {
      position: absolute;
      top: 20px;
      left: 20px;
      height: 24px;
  
      &.small-size {
        top: 10px;
        left: 10px;
      }
      .state-tag {
        height: 24px;
  
        &:nth-child(2) {
          position: absolute;
          left: 0;
          top: 30px;
        }
        &:nth-child(3) {
          position: absolute;
          left: 0;
          top: 60px;
        }
      }
    }
  
    .menu-dropdown {
      position: absolute;
      top: 14px;
      right: 14px;
    }
  
    .upper-section {
      display: flex;
      flex-flow: column;
      align-items: center;
      padding: 30px;
      height: calc(100% - 80px);
  
      &.small-size {
        height: auto;
        padding: 35px 20px 20px;
      }
  
      .title {
        margin-top: 26px;
      }
  
      .description {
        color: $skyBlueGrey700;
        margin-top: 14px;
      }
    }
    .bottom-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
      padding: 0 20px;
  
      &.small-size {
        height: auto;
        padding: 20px;
      }
  
      .price-section {
        display: flex;
        flex-flow: column;
        flex-grow: 2;
        .price-text {
          display: flex;
          align-items: flex-end;
        }
        .price-model-description {
          color: $skyBlueGrey700;
          margin-top: 8px;
        }
      }
  
      .bottom-buttons-section {
        flex-grow: 0;
        margin-left: 4px;
      }
    }
  }
  </style>
  