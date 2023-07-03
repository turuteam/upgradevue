import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { ordersActions } from './actions';
import { POSOrdersState, POSOrders, SelectedPOSOrdersMap } from './types';

export const initialPOSOrdersState = (): POSOrdersState => ({
  POSOrders: [],
  totalPOSOrdersCount: 0,
  isNoMorePOSOrders: false,
  isFetchingPOSOrders: false,
  isFetchingPOSOrdersCount: false,
  hasFetchPOSOrdersFailed: false,
  // Orders CSV
  isExportingPOSOrdersCsv: false,
  isImportingPOSOrdersCsv: false,
});

const ordersModule: Module<POSOrdersState, RootState> = {
  namespaced: true,
  state: initialPOSOrdersState,
  actions: ordersActions,
  mutations: {
    // For fetching orders
    RESET_ORDERS(state) {
      state.POSOrders = [];
      state.totalPOSOrdersCount = 0;
      state.isNoMorePOSOrders = false;
      state.hasFetchPOSOrdersFailed = false;
    },
    SET_ORDERS(state, orders: POSOrders) {
      state.POSOrders = clone(orders);
    },
    CONCAT_ORDERS(state, orders: POSOrders) {
      state.POSOrders = clone(state.POSOrders.concat(orders));
    },
    SET_ORDERS_COUNT(state, totalOrdersCount: number) {
      state.totalPOSOrdersCount = totalOrdersCount;
    },
    SET_IS_NO_MORE_ORDERS(state, isNoMoreOrders: boolean) {
      state.isNoMorePOSOrders = isNoMoreOrders;
    },
    SET_IS_FETCHING_ORDERS(state, isFetching: boolean) {
      state.isFetchingPOSOrders = isFetching;
    },
    SET_IS_FETCHING_ORDERS_COUNT(state, isFetching: boolean) {
      state.isFetchingPOSOrdersCount = isFetching;
    },
    SET_HAS_FETCH_ORDERS_FAILED(state, hasFailed: boolean) {
      state.hasFetchPOSOrdersFailed = hasFailed;
    },
    // Orders CSV
    SET_IS_EXPORTING_ORDERS_CSV(state, isExporting: boolean) {
      state.isExportingPOSOrdersCsv = isExporting;
    },
    SET_IS_IMPORTING_ORDERS_CSV(state, isImporting: boolean) {
      state.isImportingPOSOrdersCsv = isImporting;
    },
  },
  getters: {},
};

export default ordersModule;
