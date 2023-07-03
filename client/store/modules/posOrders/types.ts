/**
 * Pruned verion of Fan
 * @field name The combination of firstName and lastName
 */
 export interface PrunedPOSOrder extends SourcePOSOrder {
  name: string;
};

export type POSOrders = PrunedPOSOrder[];

export type SelectedPOSOrdersMap = {
  [key: number]: boolean | undefined;
};

/**
 * State of Fan Module
 * @field POSOrders orders
 * @field totalPOSOrdersCount Total number of lines under the order
 * @field isNoMorePOSOrders Used for pagination, it tells you if there is no more lines or not
 * @field isFetchingPOSOrders Let you know if Vuex is still fetching lines from server
 * @field isFetchingPOSOrdersCount We fetch the orders data & count separately due to performance issue, so we need this state
 * @field hasFetchPOSOrdersFailed indicate the fetch failed or not
 * @field isExportingPOSOrdersCsv indicate the export POSOrders csv is in progress or not, compatible with order export
 * @field isImportingPOSOrdersCsv indicate the import POSOrders csv is in progress or not, compatible with order import
 */
export type POSOrdersState = {
  POSOrders: POSOrders,
  totalPOSOrdersCount: number;
  isNoMorePOSOrders: boolean;
  isFetchingPOSOrders: boolean;
  isFetchingPOSOrdersCount: boolean;
  hasFetchPOSOrdersFailed: boolean;
  // POS Orders CSV
  isExportingPOSOrdersCsv: boolean;
  isImportingPOSOrdersCsv: boolean;
};
  