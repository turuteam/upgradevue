/**
 * POSorder Object
 * This is the fan data format from server,
 * if you find any field missing, please add it here, cheers.
 */
 type SourcePOSOrder = {
    firstName: string;
    lastName: string;
    sysMtime: Date;
    orderDate: Date;
    fanAccount: [];
    status: string;
    provider: string;
    sourceInfo: [];
    cost: {
      value: string,
      currency: string,
      displayValue: string};

    puid: string;
    oid: number;
  }
