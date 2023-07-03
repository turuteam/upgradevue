export type ShortUrl = {
  oid: number,
  taskOid: number,
  promoterOid: number,
  targetUrl: string,
  sysCtime: string,
};

export type ShortUrlsState = {
  shortUrls: ShortUrl[],
  isFetchingShortUrls: boolean,
};