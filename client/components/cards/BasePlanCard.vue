<template>
    <am2-card-container
      :class="[
        'base-plan-card-wrapper',
        showAs,
        hasNoPlan && 'no-plan',
      ]"
    >
      <am2-change-payment-source-modal
        :is-open="displayChangePaymentSourceModal"
        :payment-plan="paymentPlan"
        :payment-source-puid="defaultPaymentSourcePuid"
        :payment-subscriptions="[paymentSubscription]"
        @change="handlePaymentSourceChange"
        @cancel="handlePaymentSourceCancel"
      />
      <div :class="['right-top-fix-section', showAs]">
        <am2-icon-button-dropdown
          v-if="!hasNoPlan && !subscriptionIsNotRenewing"
          align="left"
          :items="actionItems"
          :dropdown-style="{
            width: '200px',
          }"
          @select="handleActionClick"
        />
      </div>
      <ar-icon
        v-bind="planIconProps"
      />
      <div
        class="text-section"
      >
        <div class="text-section-upper-section">
          <ar-text
            size="md"
            :text="planName"
            weight="bold"
            :style="{
              color: hasNoPlan ? 'white' : null,
            }"
          />
          <am2-tag
            v-if="subscriptionIsNotRenewing"
            class="tag"
            type="red"
            text="Not renewing"
          />
        </div>
        <ar-text
          class="description"
          size="xs"
          :text="planDescription"
          multiple-lines
          :style="{
            color: hasNoPlan ? 'white' : $arStyle.color.skyBlueGrey700,
          }"
        />
      </div>
      <div class="button-section">
        <ar-simple-button
          v-if="hasNoPlan"
          text="Select a plan"
          outlined
          :style="{
            border: 'none',
          }"
          @click="handleSelectPlanButtonClick"
        />
        <ar-simple-button
          v-else-if="subscriptionIsNotRenewing"
          text="Renew"
          :loading="undoSubscriptionCancellationStatusMap[paymentSubscription.oid]"
          @click="handleRenewClick"
        />
      </div>
    </am2-card-container>
  </template>
  
  <script>
  import moment from 'moment';
  import { hexToRGBA } from '@/utils/helpers/';
  import { mapActions, mapState } from 'vuex';
  
  export default {
    name: 'NoPlanCard',
  
    props: {
      paymentPlan: {
        type: Object,
        default: null,
      },
      paymentSubscription: {
        type: Object,
        default: null,
      },
      addOnSubscriptions: {
        type: Array,
        default: () => [],
      },
      primaryPaymentSource: {
        type: Object,
        default: null,
      },
      showAs: {
        type: String,
        required: true,
        validator: function (value) {
          return ['list', 'tiles'].indexOf(value) !== -1;
        },
      },
    },
  
    data() {
      return {
        displayChangePaymentSourceModal: false,
      };
    },
  
    computed: {
      ...mapState({
        undoSubscriptionCancellationStatusMap: state => state.payment.undoSubscriptionCancellationStatusMap,
      }),
      actionItems() {
        // Custom plans get no options...
        if(this.paymentPlan?.additionalInfo?.metaData && (this.paymentPlan.additionalInfo.metaData.childOf) || !this.paymentPlan.additionalInfo.metaData.clientVisible) return [
          {
            name: 'Contact Sales',
            key: 'contactSales',
          }
        ];
  
        return [
          {
            name: 'Update plan',
            key: 'updatePlan',
          },
          {
            name: 'Change plan',
            key: 'changePlan',
          },
          {
            name: 'Change payment method',
            key: 'changePaymentMethod',
          },
          {
            name: 'Cancel plan',
            key: 'cancelPlan',
            typography: {
              style: {
                color: this.$arStyle.color.red500,
              },
            },
          },
        ];
      },
      defaultPaymentSourcePuid() {
        let defaultPaymentSourcePuid = null;
        if (this.paymentSubscription) {
          defaultPaymentSourcePuid = this.paymentSubscription.additionalInfo.paymentSourceId;
        } else {
          defaultPaymentSourcePuid = this.primaryPaymentSource ? this.primaryPaymentSource.puid : null;
        }
        return defaultPaymentSourcePuid;
      },
      hasNoPlan() {
        return !this.paymentPlan;
      },
      planIconProps() {
        return {
          name: 'audience',
          color: this.$arStyle.color.purple500,
          width: '30px',
          height: '30px',
          wrapperStyle: {
            display: 'inline-flex',
            alignItem: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            minWidth: '60px',
            border: `1px solid ${this.$arStyle.color.skyBlueGrey400}`,
            boxShadow: `0 0 15px 0 ${hexToRGBA(this.$arStyle.color.blueGrey800, 0.1)}`,
            borderRadius: '50%',
            background: 'white',
          },
        };
      },
      planName() {
        if (this.hasNoPlan) return 'No plan yet';
        return this.paymentPlan.additionalInfo.invoiceName || this.paymentPlan.name || null;
      },
      planDescription() {
        return this.hasNoPlan ? 'Select a plan to unlock your Audience Republic account' : this.paymentPlan.description;
      },
      subscriptionIsNotRenewing() {
        return this.paymentSubscription && this.paymentSubscription.providerStatus === 'non_renewing';
      },
    },
  
    methods: {
      ...mapActions([
        'payment/UNDO_PAYMENT_SUBSCRIPTION_CANCELLATIONS',
        'payment/CANCEL_PAYMENT_SUBSCRIPTIONS',
        'OPEN_CANCELLATION_MODAL',
      ]),
      async deltePaymentSubscription({ reason }) {
        const succeed = await this['payment/CANCEL_PAYMENT_SUBSCRIPTIONS']({
          oids: [this.paymentSubscription.oid],
          reason,
        })
  
        if (succeed) {
          this.$emit('subscriptionStateUpdate');
        }
      },
      async handleRenewClick() {
        const succeed = await this['payment/UNDO_PAYMENT_SUBSCRIPTION_CANCELLATIONS']([this.paymentSubscription.oid]);
        if (succeed) {
          this.$emit('subscriptionStateUpdate');
        }
      },
      handleSelectPlanButtonClick() {
        this.$router.push({
          path: '/plans',
        });
      },
      handleUpdatePlanClick() {
        this.$router.push({
          path: `/plans/${this.paymentPlan.oid}/subscribe`,
        });
      },
      handleActionClick(action) {
        if (action.key === 'cancelPlan') {
          this.handleCancelSubscriptionClick();
        } else if (action.key === 'updatePlan') {
          this.handleUpdatePlanClick();
        } else if (action.key === 'changePlan') {
          this.handleSelectPlanButtonClick();
        } else if (action.key === 'changePaymentMethod') {
          this.displayChangePaymentSourceModal = true;
        } else if (action.key === 'contactSales') {
          this.handleContactSalesClick();
        }
      },
      handleContactSalesClick() {
        window.open('https://audiencerepublic.com/contact-us?type=organizer');
      },
      handlePaymentSourceChange() {
        this.displayChangePaymentSourceModal = false;
        this.$emit('subscriptionStateUpdate');
      },
      handlePaymentSourceCancel() {
        this.displayChangePaymentSourceModal = false;
      },
      handleCancelSubscriptionClick() {
        const baseExpiryVal = this.paymentSubscription.additionalInfo.currentTermEnd * 1000;
        const endDate = moment(baseExpiryVal).local().format('dddd MMMM Do, YYYY');
        const planName = this.paymentPlan.additionalInfo.invoiceName || this.paymentPlan.name;
  
        /*
        Get features which cancelling this plan will also cancel:
        1. Get a list of all subscribed addons
          a. Get all this.paymentSubscriptions where pplanId is NOT basic-annual-usd, pro-annual-usd or plus-annual-usd
        2. Filter out any addons which are included in the plan
        3. Pass those into the featureSelection param which is sent with OPEN_CANCELLATION_MODAL
         */
  
        const allowedAddons = this.paymentPlan.additionalInfo?.metaData?.allowedSubscriptions || [];
        const includedAddons = this.paymentPlan.additionalInfo?.metaData?.includedSubscriptions ? Object.keys(this.paymentPlan.additionalInfo.metaData.includedSubscriptions) : [];
        const planIdsToCancel = allowedAddons.concat(includedAddons);
        const addonsToBeCancelled = this.addOnSubscriptions.filter( item => {
          if (planIdsToCancel.indexOf(item.pplanId) > -1) return true;
          if (item.paymentPlan.additionalInfo && planIdsToCancel.indexOf(item.paymentPlan.additionalInfo?.metaData?.childOf) > -1) return true;
          return false;
        });
  
        const featureList = addonsToBeCancelled.map( item => {
  
          // If an addon-to-be-cancelled has an expiry date greater than plan expiry date,
          // then set the addon's expiry date to be the same as the plan.
          let expiryVal = item.additionalInfo ? item.additionalInfo.currentTermEnd * 1000 : false;
          if(expiryVal && expiryVal > baseExpiryVal) expiryVal = baseExpiryVal;
  
          return {
            image: null,
            name: item.paymentPlan.name,
            expiry: item.additionalInfo ? moment(expiryVal).local().format('MM/DD/YY') : null,
          };
        });
  
        // If number of features is greater than 0, then add the plan as item 0.
        if (featureList.length > 0) {
          const newPseudoFeature = {
            image: null,
            name: planName,
            expiry: moment(baseExpiryVal).local().format('MM/DD/YY'),
          };
          featureList.unshift(newPseudoFeature);
        }
  
        const messageToShow = featureList.length > 0 ?
          `If you proceed, you'll still have access to all plan features and add-ons until the <strong>end dates below</strong>.<br/><br/>After this you'll no longer have access, and you will not be billed again, unless you choose to re-subscribe.` :
          `If you proceed, you'll still have access to all ${planName} features until <strong>${endDate}</strong>.<br/><br/>After this you'll no longer have access, and you will not be billed again, unless you choose to re-subscribe.`
  
        this.OPEN_CANCELLATION_MODAL({
          title: `Are you sure you want to cancel your ${planName}?`,
          messageHtmlBefore: messageToShow,
          showCancellationReasonTextarea: true,
          cancellationReasonPlaceholder: "Let us know why you want to cancel your plan...",
          featureList,
          confirmButtonProps: {
            text: `Cancel ${planName}`,
            type: 'red',
            style: {
              width: 'auto',
              borderRadius: '7px',
            }
          },
          asyncCompleteFunction: this.deltePaymentSubscription,
        });
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .base-plan-card-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    padding: 30px 20px 30px 30px;
  
    .right-top-fix-section {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
  
      &.tiles {
        top: 20px;
        right: 20px;
        transform: unset;
      }
    }
  
    .text-section {
      display: flex;
      flex-flow: column;
      flex-grow: 1;
      padding: 0 25px;
  
      .description {
        margin-top: 10px;
      }
  
      .text-section-upper-section {
        display: flex;
        align-items: center;
  
        .tag {
          margin-left: 10px;
        }
      }
    }
  
    &.tiles {
      flex-direction: column;
      padding: 20px 12px 20px 12px;
  
      & > div {
        margin: 8px 0 8px;
      }
  
      .text-section {
        align-items: center;
      }
    }
  
    &.no-plan {
      background: $purpleGradient;
    }
  
    .button-section {
      flex-shrink: 0;
    }
  }
  </style>
  