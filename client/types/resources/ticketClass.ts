
interface TicketClass {
  oid: number;
  promoterOid: number;
  eventOid: number;
  name: string;
  cost: {
    value: number;
    currency: string;
    displayValue: string;
  };
  sysCtime: string;
  provider: string;
  sysActivep: boolean;
}
