import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers';
import { PaymentState, PrunedPaymentPlan } from './types';
import { mergePlansAndSubscriptions } from './utils';
import { paymentActions } from './actions';

export const initialPaymentState = (): PaymentState => ({
  paymentCustomer: null,
  hasFetchedPaymentCustomer: false,
  // Payment Subscriptions
  paymentSubscriptionList: [],
  isFetchingPaymentSubscriptions: false,
  undoSubscriptionCancellationStatusMap: {},
  // Payment Plans
  paymentPlanList: [],
  isFetchingPaymentPlans: false,
  // Payment Plan
  currentPaymentPlan: null,
  isFetchingCurrentPaymentPlan: false,
  // Payment Sources
  paymentSources: [],
  isFetchingPaymentSources: false,
  primaryPaymentSourcePuid: null,
  // Create Payment Source
  isCreatingPaymentSource: false,
  // Delete Payment Source
  isDeletingPaymentSource: false,
  // Update Payment Source
  isUpdatingPaymentSource: false,
  // Payment Invoices
  paymentInvoices: [],
  totalPaymentInvoiceCount: 0,
  hasFetchPaymentInvoicesFailed: false,
  isFetchingPaymentInvoices: false,
  hasNoMorePaymentInvoices: false,
});

const paymentModule: Module<PaymentState, RootState> = {
  namespaced: true,
  state: initialPaymentState,
  actions: paymentActions,
  getters: {
    primaryPaymentSource(state): PaymentSource | null {
      return state.paymentSources.filter(({ puid }) => {
        return puid === state.primaryPaymentSourcePuid;
      })[0] || null;
    },
    advancedPaymentPlanSubscriptionInformation(state): {
      basePaymentPlans: PrunedPaymentPlan[];
      addOnPaymentPlans: PrunedPaymentPlan[];
      basePaymentSubscription: PaymentSubscription | null;
      addOnPaymentSubscriptions: PaymentSubscription[];
    } {
      return mergePlansAndSubscriptions(state.paymentPlanList, state.paymentSubscriptionList);
    },
  },
  mutations: {
    SET_PAYMENT_CUSTOMER(state, paymentCustomer: PaymentCustomer) {
      state.paymentCustomer = clone(paymentCustomer);
    },
    SET_PAYMENT_CUSTOMER_IS_FETCHED(state, fetchedState: boolean) {
      state.hasFetchedPaymentCustomer = fetchedState;
    },
    // Payment Subscriptions
    SET_PAYMENT_SUBSCRIPTIONS(state, paymentSubscriptionList: PaymentSubscription[]) {
      state.paymentSubscriptionList = clone(paymentSubscriptionList);
    },
    SET_IS_FETCHING_PAYMENT_SUBSCRIPTIONS(state, isFetching: boolean) {
      state.isFetchingPaymentSubscriptions = isFetching;
    },
    PUT_UNDO_SUBSCRIPTION_CANCELLATION_STATUS_MAP(state, { oid, isUndoing }: { oid: number, isUndoing: boolean }) {
      const newUndoSubscriptionCancellationStatusMap = clone(state.undoSubscriptionCancellationStatusMap);
      newUndoSubscriptionCancellationStatusMap[oid] = isUndoing;
      state.undoSubscriptionCancellationStatusMap = newUndoSubscriptionCancellationStatusMap;
    },
    // Payment Plans
    SET_PAYMENT_PLANS(state, paymentPlanList: PaymentPlan[]) {
      state.paymentPlanList = clone(paymentPlanList);
    },
    SET_IS_FETCHING_PAYMENT_PLANS(state, isFetching: boolean) {
      state.isFetchingPaymentPlans = isFetching;
    },
    // Current Payment Plan
    RESET_CURRENT_PAYMENT_PLAN(state) {
      state.currentPaymentPlan = null;
    },
    SET_CURRENT_PAYMENT_PLAN(state, paymentPlan: PaymentPlan) {
      state.currentPaymentPlan = clone(paymentPlan);
    },
    SET_IS_FETCHING_CURRENT_PAYMENT_PLAN(state, isFetching: boolean) {
      state.isFetchingCurrentPaymentPlan = isFetching;
    },
    // Payment Sources
    SET_PRIMARY_PAYMENT_SOURCE_PUID(state, puid: string) {
      state.primaryPaymentSourcePuid = puid;
    },
    SET_PAYMENT_SOURCES(state, paymentSources: PaymentSource[]) {
      state.paymentSources = clone(paymentSources);
    },
    PATCH_IN_PAYMENT_SOURCES(state, { oid, changes }) {
      let clonedPaymentSources: PaymentSource[] = clone(state.paymentSources);
      clonedPaymentSources = clonedPaymentSources.map(paymentSource => {
        return paymentSource.oid === oid ? mergeObjects(paymentSource, changes) : paymentSource;
      });
      state.paymentSources = clonedPaymentSources;
    },
    ADD_TO_PAYMENT_SOURCES(state, paymentSource: PaymentSource) {
      state.paymentSources = clone(state.paymentSources.concat([paymentSource]));
    },
    REMOVE_FROM_PAYMENT_SOURCES(state, paymentSourceOid: number) {
      state.paymentSources = clone(state.paymentSources.filter(paymentSource => {
        return paymentSource.oid !== paymentSourceOid;
      }));
    },
    SET_IS_FETCHING_PAYMENT_SOURCES(state, isFetching: boolean) {
      state.isFetchingPaymentSources = isFetching;
    },
    // Create Payment Source
    SET_IS_CREATING_PAYMENT_SOURCE(state, isCreating: boolean) {
      state.isCreatingPaymentSource = isCreating;
    },
    // Delete Payment Source
    SET_IS_DELETING_PAYMENT_SOURCE(state, isDeleting: boolean) {
      state.isDeletingPaymentSource = isDeleting;
    },
    // Update Payment Source
    SET_IS_UPDATING_PAYMENT_SOURCE(state, isUpdating: boolean) {
      state.isUpdatingPaymentSource = isUpdating;
    },
    // Payment Invoices
    RESET_PAYMENT_INVOICES(state) {
      state.hasNoMorePaymentInvoices = false;
      state.hasFetchPaymentInvoicesFailed = false;
      state.paymentInvoices = [];
    },
    SET_PAYMENT_INVOICES(state, paymentInvoices: PaymentInvoice[]) {
      state.paymentInvoices = clone(paymentInvoices);
    },
    CONCAT_PAYMENT_INVOICES(state, paymentInvoices: PaymentInvoice[]) {
      state.paymentInvoices = clone(state.paymentInvoices.concat(paymentInvoices));
    },
    SET_TOTAL_PAYMENT_INVOICE_COUNT(state, count: number) {
      state.totalPaymentInvoiceCount = count;
    },
    SET_IS_FETCHING_PAYMENT_INVOICES(state, isFetching: boolean) {
      state.isFetchingPaymentInvoices = isFetching;
    },
    SET_HAS_NO_MORE_PAYMENT_INVOICES(state, hasNoMoreData: boolean) {
      state.hasNoMorePaymentInvoices = hasNoMoreData;
    },
    SET_HAS_FETCH_PAYMENT_INVOICES_FAILED(state, hasFailed: boolean) {
      state.hasFetchPaymentInvoicesFailed = hasFailed;
    },
  },
};

export default paymentModule;
