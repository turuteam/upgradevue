export interface ApiToken {
    oid: number;
    promoterOid: number;
    token: string;
    sysCtime: Date;
    sysMtime: object;
    sysActivep: boolean;
    isBeingDeleted: boolean;
}