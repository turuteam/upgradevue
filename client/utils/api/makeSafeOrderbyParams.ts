export const makeSafeOrderbyParams =
  (orderBy: {key: string, order: string}, defaultSortKey = 'oid'): string => {
  if (!orderBy) return `${defaultSortKey} desc`;

  if (orderBy.key === defaultSortKey) return `${orderBy.key} ${orderBy.order}`;

  return `${orderBy.key} ${orderBy.order}, ${defaultSortKey} desc`;
}
