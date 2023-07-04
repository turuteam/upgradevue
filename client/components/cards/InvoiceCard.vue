<template>
    <div :class="['invoice-card', showAs]">
      <div :class="[
        'invoice-card-left',
        !getInvoiceCardIconName && 'no-credit-card',
      ]">
        <ar-text
          size="xs"
          class="invoice-date"
          :text="generatedDate"
          weight="bold"
          :style="{
            width: '118px',
          }"
        />
        <ar-text
          size="xs"
          class="invoice-title"
          :text="planName"
        />
      </div>
      <div :class="[
        'invoice-card-middle',
        !getInvoiceCardIconName && 'no-credit-card',
      ]">
        <section
          v-if="getInvoiceCardIconName"
          class="invoice-card-number">
          <ar-icon
            v-if="getInvoiceCardIconName"
            :name="getInvoiceCardIconName"
            width="24px"
            height="20px"
          />
          <ar-text
            size="xs"
            :text="getPaymentCardEnding ? `•••• ${getPaymentCardEnding}` : ''"
            class="u-margin-left-2"
          />
        </section>
        <section class="invoice-price">
          <ar-text
            size="xs"
            :text="priceCopy"
          />
        </section>
      </div>
      <div class="invoice-card-right">
        <ar-simple-button
          class="view-pdf-button"
          text="View PDF"
          outlined
          :disabled="isDownloadingPaymentInvoicePdf"
          @click="handleDownloadPdfClick"
        />
      </div>
    </div>
  </template>
  
  <script>
  import accounting from 'accounting';
  import moment from 'moment';
  import { mapActions } from 'vuex';
  
  export default {
    name: 'InvoiceCard',
    props: {
      paymentInvoice: {
        type: Object,
        default: null,
      },
      showAs: {
        type: String,
        default: 'list',
        validator: (val) => ['list', 'tiles'].indexOf(val) > -1,
      },
    },
    data() {
      return {
        isDownloadingPaymentInvoicePdf: false,
      };
    },
    computed: {
      generatedDate() {
        if (!this.paymentInvoice) {
          return null;
        }
        return moment.utc(this.paymentInvoice.generatedAt).format('MMM DD, YYYY');
      },
      planName() {
        if (!this.paymentInvoice) {
          return null;
        }
        return  this.paymentInvoice?.additionalInfo?.lineItems && this.paymentInvoice.additionalInfo.lineItems.length > 0
            ? this.paymentInvoice.additionalInfo.lineItems[0].description
            : "";
      },
      priceCopy() {
        if (!this.paymentInvoice) {
          return null;
        }
        return `${this.paymentInvoice.currencyCode} $${accounting.formatNumber(this.paymentInvoice.totalAmount / 100)}`;
      },
      getInvoiceCardIconName() {
        if (!this.paymentInvoice) return null;
        if(!this.paymentInvoice.additionalInfo || !this.paymentInvoice.additionalInfo.card || !this.paymentInvoice.additionalInfo.card.brand) return null;
  
        return `payment-${this.paymentInvoice.additionalInfo.card.brand.replace(/_/g, '-')}`;
      },
      getPaymentCardEnding() {
        if (!this.paymentInvoice) return null;
        if(!this.paymentInvoice.additionalInfo || !this.paymentInvoice.additionalInfo.card || !this.paymentInvoice.additionalInfo.card.last4) return null;
  
        return this.paymentInvoice.additionalInfo.card.last4;
      },
    },
    methods: {
      ...mapActions([
        'payment/DOWNLOAD_PAYMENT_INVOICE_PDF',
      ]),
      async handleDownloadPdfClick() {
        this.isDownloadingPaymentInvoicePdf = true;
        await this['payment/DOWNLOAD_PAYMENT_INVOICE_PDF'](this.paymentInvoice.oid);
        this.isDownloadingPaymentInvoicePdf = false;
      },
      handleButtonClick() {
        this.$emit('click');
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .invoice-card {
    display: flex;
    align-items: center;
    background-color: #FFF;
    padding: 22px;
  
    .invoice-card-left {
      display: flex;
      align-items: center;
      flex-basis: 55%;
      flex-wrap: wrap;
      padding-right:12px;
      max-width: calc(55% - 12px);
  
      &.no-credit-card {
        max-width: calc(67% - 12px);
        flex-basis: 67%;
      }
      .invoice-title {
        margin:8px 0;
        max-width: calc(100% - 120px);
      }
    }
    .invoice-card-middle {
      display: flex;
      align-items: center;
      flex-basis: 34%;
      flex-wrap: wrap;
      padding-right:12px;
      &.no-credit-card {
        flex-basis: 22%;
      }
      .invoice-card-number {
        width: 80px;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        margin-right: 12px;
      }
      .invoice-price {
        min-width: 100px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        margin: 8px 0;
      }
    }
    .invoice-card-right {
      display: flex;
      flex-basis: 11%;
      .view-pdf-button {
        margin-left: 10px;
      }
    }
    &.tiles {
      flex-direction: column;
      align-items: flex-start;
  
      .invoice-card-left {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        max-width: none;
  
        .invoice-title {
          margin-top:12px;
          max-width: 100%;
        }
      }
      .invoice-card-middle {
        padding-top:16px;
        width: 100%;
        justify-content: space-between;
      }
      .invoice-card-right {
        padding-top:16px;
        width: 100%;
        justify-content: center;
        display:flex;
        .view-pdf-button {
          margin: 0;
        }
      }
    }
  }
  </style>
  