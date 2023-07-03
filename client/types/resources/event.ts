interface EventTicketStats {
  revenuePerProvider: {
    provider: string;
    ticketSales: number;
    totalTickets: number;
    percentageTicketSales: number;
    percentageTotalTickets: number;
  }[];
  revenuePerTicketType: {
    ticketType: string;
    ticketSales: number;
    totalTickets: number;
    percentageTicketSales: number;
    percentageTotalTickets: number;
  }[];
  aggregateTicketTypeSeries: {
    ticketType: string;
    ticketSales: number;
    totalTickets: number;
    percentageTicketSales: number;
    percentageTotalTickets: number;
  }[];
  sysCtime: string;
  capacity: string;
  sysMtime: string;
  totalTicketsSold: number;
  totalTicketSales: number;
  eventOid: number;
  revenuePerHour: {
    hour?: number;
    value: number;
    percentage: number;
  }[];
  averageOrderSize: number;
  averageTicketsPerOrder: number;
  currency: string;
  attendees: number;
  oid: number;
  totalTicketSalesComparedToLastYear: number;
  averageOrderSizeComparedToLastYear: number;
  revenuePerDay: {
    day: string;
    value: number;
    percentage: number;
  }[];
  promoterOid: number;
}

interface EventTicketSales {
  oid: number;
  sales: {
    ts?: string;
    sales: number;
    tickets: number;
  }[];
  cumulativeSales: {
    ts?: string;
    sales: number;
    tickets: number;
  }[];
}

interface ApexSeries {
  name: string;
  data: any;
  oid?: number;
}
