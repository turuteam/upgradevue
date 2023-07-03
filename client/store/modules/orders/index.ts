import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { ordersActions } from './actions';
import { OrdersState, Orders, SelectedOrdersMap } from './types';

export const initialOrdersState = (): OrdersState => ({
  orders: [],
  totalOrdersCount: 0,
  isNoMoreOrders: false,
  isFetchingOrders: false,
  isFetchingOrdersCount: false,
  hasFetchOrdersFailed: false,
  // Orders CSV
  isExportingOrdersCsv: false,
  isImportingOrdersCsv: false,
});

const ordersModule: Module<OrdersState, RootState> = {
  namespaced: true,
  state: initialOrdersState,
  actions: ordersActions,
  mutations: {
    // For fetching orders
    RESET_ORDERS(state) {
      state.orders = [];
      state.totalOrdersCount = 0;
      state.isNoMoreOrders = false;
      state.hasFetchOrdersFailed = false;
    },
    SET_ORDERS(state, orders: Orders) {
      state.orders = clone(orders);
    },
    CONCAT_ORDERS(state, orders: Orders) {
      state.orders = clone(state.orders.concat(orders));
    },
    SET_ORDERS_COUNT(state, totalOrdersCount: number) {
      state.totalOrdersCount = totalOrdersCount;
    },
    SET_IS_NO_MORE_ORDERS(state, isNoMoreOrders: boolean) {
      state.isNoMoreOrders = isNoMoreOrders;
    },
    SET_IS_FETCHING_ORDERS(state, isFetching: boolean) {
      state.isFetchingOrders = isFetching;
    },
    SET_IS_FETCHING_ORDERS_COUNT(state, isFetching: boolean) {
      state.isFetchingOrdersCount = isFetching;
    },
    SET_HAS_FETCH_ORDERS_FAILED(state, hasFailed: boolean) {
      state.hasFetchOrdersFailed = hasFailed;
    },
    // Orders CSV
    SET_IS_EXPORTING_ORDERS_CSV(state, isExporting: boolean) {
      state.isExportingOrdersCsv = isExporting;
    },
    SET_IS_IMPORTING_ORDERS_CSV(state, isImporting: boolean) {
      state.isImportingOrdersCsv = isImporting;
    },
  },
  getters: {},
};

export default ordersModule;
