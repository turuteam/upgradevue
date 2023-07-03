type Recipient = {
  sysCtime: string;
  sysMtime: string;
  fanOid: number;
  oid: number;
  status: 'sent' | 'opened' | 'clicked' | 'failed' | 'deferred' | 'undelivered';
  fan: {
    oid: number;
    lastName: string | null;
    firstName: string | null;
    emailAddress: string;
    mobileNumber: string | null;
  };
};