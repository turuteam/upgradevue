/**
 * Fan Object
 * This is the fan data format from server,
 * if you find any field missing, please add it here, cheers.
 */
type SourceOrder = {
  firstName: string;
  lastName: string;
  sysMtime: Date;
  orderDate: Date;
  fanAccount: [];
  status: string;
  provider: string;
  totalTickets: number;
  value: string;
  oid: number;
}
  
  