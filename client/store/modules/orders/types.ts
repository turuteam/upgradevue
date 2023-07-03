/**
 * Pruned verion of Fan
 * @field name The combination of firstName and lastName
 */
 export interface PrunedOrder extends SourceOrder {
  name: string;
};

export type Orders = PrunedOrder[];

export type SelectedOrdersMap = {
  [key: number]: boolean | undefined;
};

/**
 * State of Fan Module
 * @field orders orders
 * @field totalOrdersCount Total number of fans
 * @field isNoMoreOrders Used for pagination, it tells you if there is no more fans or not
 * @field isFetchingOrders Let you know if Vuex is still fetching fans from server
 * @field isFetchingOrdersCount We fetch the orders data & count separately due to performance issue, so we need this state
 * @field promoterOrdersCount Total orders count of the promoter without filter
 * @field isFetchingPromoterOrdersCount Is fetching promoter orders count
 * @field fanKeyword Keyword that will be combined into 'scratchOrdersFilter'
 */
export type OrdersState = {
  orders: Orders,
  totalOrdersCount: number;
  isNoMoreOrders: boolean;
  isFetchingOrders: boolean;
  isFetchingOrdersCount: boolean;
  hasFetchOrdersFailed: boolean;
  // Orders CSV
  isExportingOrdersCsv: boolean;
  isImportingOrdersCsv: boolean;
};
  