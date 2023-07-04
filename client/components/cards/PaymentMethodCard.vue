<template>
    <section
      :class="[
        'payment-method-card',
        cardExpiryStatus,
      ]"
    >
      <am2-update-billing-details-modal
        :is-show="displayUpdateBillingDetailsModal"
        :payment-source="paymentMethod"
        @update="handleBillingDetailsUpdate"
        @cancel="handleUpdateBillingDetailsCancel"
      />
      <section
        :class="[
          'content-section',
          size,
        ]"
      >
        <div
          class="icon-container"
        >
          <ar-icon
            :name="getPaymentIconName"
            width="48px"
            height="40px"
          />
        </div>
        <div
          class="details-container"
        >
          <ar-text
            size="xs"
            :text="`Ending in <b>${paymentMethodLast4}<b>`"
            allow-html
          />
          <section
            class="u-display-flex u-margin-top-1"
          >
            <ar-text
              size="xs"
              :text="paymentMethodName"
              :style="{
                color: $arStyle.color.skyBlueGrey700,
              }"
            />
            <ar-text
              size="xs"
              text="–"
              class="u-margin-x-2"
              :style="{
                color: $arStyle.color.skyBlueGrey700,
              }"
            />
            <ar-text
              size="xs"
              :text="niceExpiry"
              :style="{
                color: $arStyle.color.skyBlueGrey700,
              }"
            />
          </section>
        </div>
        <div class="top-right-fix">
          <div class="tag-container">
            <am2-tag
              v-if="isDefault"
              type="green"
              shape="rectangle"
              text="Default"
              text-size="xxxs"
            />
            <am2-tag
              v-if="cardExpiryStatus === 'expired'"
              type="red"
              shape="rectangle"
              text="Expired"
              text-size="xxxs"
              :style="{
                marginLeft: isDefault ? '8px' : 0,
              }"
            />
            <am2-tag
              v-if="cardExpiryStatus === 'expiring-soon'"
              type="red"
              shape="rectangle"
              text="Expiring Soon"
              text-size="xxxs"
              :style="{
                marginLeft: isDefault ? '8px' : 0,
              }"
            />
          </div>
          <am2-icon-button-dropdown
            align="left"
            :items="[
              {
                name: 'Edit card',
                key: 'editCard',
              },
              {
                name: 'Set as default',
                key: 'setDefault',
              },
              {
                name: 'Remove card',
                typography: {
                  style: {
                    color: $arStyle.color.red500,
                  },
                },
                key: 'deleteCard',
              }
            ]"
            @select="actionDropdownSelect"
          />
        </div>
      </section>
    </section>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  import { getRelevantSubscriptionsByPaymentSource } from '@/utils/payment';
  
  export default {
    name: 'PaymentMethodCard',
  
    props: {
      paymentMethod: {
        type: Object,
        default: () => null,
      },
      paymentSubscriptions: {
        type: Array,
        default: () => [],
      },
      isDefault: {
        type: Boolean,
      },
      size: {
        type: String,
        default: 'regular',
        validator: (value) =>
          ['xs', 'regular'].indexOf(value) !== -1
      },
    },
  
    data() {
      return {
        displayUpdateBillingDetailsModal: false,
      };
    },
  
    computed: {
      paymentMethodLast4() {
        if (!this.paymentMethod) {
          return null;
        }
        return this.paymentMethod.additionalInfo.card.last4;
      },
      paymentMethodName() {
        if (!this.paymentMethod) {
          return null;
        }
        const card = this.paymentMethod.additionalInfo.card;
        return `${card.firstName ? card.firstName : ''}${card.firstName && card.firstName ? ' ' : ''}${card.lastName ? card.lastName : ''}`;
      },
      getPaymentIconName() {
        if (!this.paymentMethod) {
          return null;
        }
        switch (this.paymentMethod.additionalInfo.card.brand) {
          case 'visa':
            return 'payment-visa';
            break;
          case 'mastercard':
            return 'payment-mastercard';
            break;
          case 'american_express':
            return 'payment-american-express';
            break;
          default:
            return 'payment-visa';
            break;
        }
      },
      niceExpiry() {
        if (!this.paymentMethod) {
          return null;
        }
        const expiryMonth = this.paymentMethod.additionalInfo.card.expiryMonth;
        const expiryYear = this.paymentMethod.additionalInfo.card.expiryYear;
        if (!expiryMonth) return '';
        if (!expiryYear) return '';
        if (expiryYear.length < 4) return '';
        const niceMonthString = expiryMonth >= 10 ? expiryMonth.toString() : `0${expiryMonth}`;
        return `${niceMonthString}/${expiryYear.toString().substr(2,2)}`
      },
      cardExpiryStatus() {
        if (!this.paymentMethod) {
          return null;
        }
        const expiryMonth = this.paymentMethod.additionalInfo.card.expiryMonth;
        const expiryYear = this.paymentMethod.additionalInfo.card.expiryYear;
  
        const currentDate = new Date();
        const currMonthVal = currentDate.getMonth() + 1;
        const currYearVal = currentDate.getFullYear();
  
        if (currYearVal > expiryYear) {
          return 'expired';
        }
  
        if (currYearVal === expiryYear) {
          if (currMonthVal > expiryMonth) {
            return 'expired';
          } else if (expiryMonth - currMonthVal <= 1) {
            // If card is going to be expired this month or next month
            return 'expiring-soon';
          }
        }
  
        return 'valid';
      }
    },
  
    methods: {
      ...mapActions([
        'payment/CHANGE_PRIMARY_PAYMENT_SOURCE',
        'payment/DELETE_PAYMENT_SOURCE',
        'SHOW_CONFIRM',
        'OPEN_CANCELLATION_MODAL',
      ]),
      actionDropdownSelect(item) {
        switch (item.key) {
          case 'editCard':
            this.handleCardEdit();
            break;
          case 'setDefault':
            this.handleCardDefault();
            break;
          case 'deleteCard':
            this.handleCardDelete();
            break;
        }
      },
      async deletePaymentSource() {
        const succeed = await this['payment/DELETE_PAYMENT_SOURCE'](this.paymentMethod.oid);
        if (succeed) {
          this.$emit('paymentSourceUpdated');
        }
      },
      // First, check to see whether the card is currently even able to be deleted
      // If not, we want to stop this transaction and throw up a card delete failure modal
      // Otherwise, open the card delete confirm modal
      async handleCardDelete() {
        const isCardUsed = await this.checkIfCardIsUsed(this.paymentMethod);
  
        // Can't delete
        if (isCardUsed) {
          return;
        }
  
        // Card not in use - show modal
        const agreedToCancel = await this.OPEN_CANCELLATION_MODAL({
          title: 'Are you sure you want to remove this card?',
          showCancellationReasonTextarea: false,
          confirmButtonProps: {
            text: 'Remove Card',
            type: 'red',
            style: {
              width: '150px',
              borderRadius: '7px',
            },
          },
          asyncCompleteFunction: this.deletePaymentSource,
        });
  
        if (agreedToCancel) {
          this.$emit('paymentSourceUpdated');
        };
      },
  
      handleCardEdit() {
        this.displayUpdateBillingDetailsModal = true;
      },
  
      // Method to call when a card deletion fails for one reason or another (Typically because the card is being used in an active subscription)
      handleCardDeleteFailure({ paymentSource, paymentSubscriptions }) {
        const paymentSubscriptionPlanNames = paymentSubscriptions.map(paymentSubscription => {
          return paymentSubscription.paymentPlan.additionalInfo.invoiceName;
        });
        let message = `The card ending in <strong>${paymentSource.additionalInfo.card.last4}</strong> is currently being used in the following active subscriptions. Please change the payment method before removing this card. <br/><br/><strong>`;
        message += paymentSubscriptionPlanNames.join('<br/>');
        message += '</strong>';
  
        this.SHOW_CONFIRM({
          title: 'Unable to remove card',
          messageHtml: message,
          hasCrossIcon: true,
          hideCancelButton: true,
          hideConfirmButton: true,
        });
      },
  
      handleCardDefault() {
        this['payment/CHANGE_PRIMARY_PAYMENT_SOURCE'](this.paymentMethod);
      },
  
      // Checks to see whether the card is in use on any active subscriptions
      async checkIfCardIsUsed(paymentSource) {
        try {
          const relevantSubs = getRelevantSubscriptionsByPaymentSource({
            paymentSubscriptions: this.paymentSubscriptions,
            paymentSource,
          })
    
          // Card is in use - bail out
          if (relevantSubs.length > 0) {
            this.handleCardDeleteFailure({
              paymentSource,
              paymentSubscriptions: relevantSubs,
            });
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error(error);
          this.$arNotification.push({
            type: 'error',
            message: 'Sorry we failed to check if you can remove this card, please try again later',
          });
          return true;
        }
      },
      handleBillingDetailsUpdate() {
        this.displayUpdateBillingDetailsModal = false;
      },
      handleUpdateBillingDetailsCancel() {
        this.displayUpdateBillingDetailsModal = false;
      },
    }
  };
  </script>
  
  <style lang="scss" scoped>
    .payment-method-card {
      width: 100%;
      background-color: #FFF;
      padding: 20px 22px;
  
      &.expired {
        background-color: $red100;
      }
  
      .content-section {
        position: relative;
        display: flex;
  
        .top-right-fix {
          display: inline-flex;
          align-items: center;
          .tag-container {
            margin-right: 8px;
  
            .tag {
              height: 24px;
            }
          }
        }
  
        &.xs {
          display: flex;
          flex-flow: column;
  
          .details-container {
            margin-top: 20px;
          }
  
          .top-right-fix {
            position: absolute;
            top: 0;
            right: 0;
          }
        }
  
        .icon-container {
          width: 74px;
          display: inline-flex;
          align-items: center;
        }
  
        .details-container {
          flex-grow: 1;
          display: inline-flex;
          flex-flow: column;
          justify-content: center;
  
          .details-card-data {
            color: $skyBlueGrey700;
            line-height: 18px;
            font-size: 14px;
  
            &-name {
              padding-right: 4px;
            }
  
            &-date {
              padding-left: 4px;
            }
          }
        }
      }
    }
  </style>
  