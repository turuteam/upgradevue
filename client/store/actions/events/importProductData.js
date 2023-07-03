import { clone } from '@/utils/helpers';

/**
 * IMPORT_TICKET_SALES
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 * @param { number } payload.rows
 * @param { number } payload.columnMap
 * @param { string } payload.importType
 * @param { number } payload.eventOid
 * @param { number } payload.subscriptions
 * @param { string } payload.currencyCode
 * @param { string } payload.mergep
 * @param { Array }  payload.csvHeaders
 */

export async function IMPORT_PRODUCT_DATA({ state, commit }, payload) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;
  let clonedPlayload = clone(payload);
  const { csvHeaders } = clonedPlayload;

  // product-import path on REST server to import product data
  let url = `/promoter/${promoterOid}/product-import`;

  // Make sure eventOid is always number
  if (clonedPlayload.eventOid) {
    clonedPlayload.eventOid = parseInt(clonedPlayload.eventOid, 10);
  }

  try {
    delete clonedPlayload.isMassImport;

    const res = await this.$axios.post(url, clonedPlayload);
    let message = '';

    // big file, therefore rows
    // will be imported asyncronously
    if (res.status === 202) {
      message = `CSV import in progress. Your POS data will be added soon`;
    } else {
      const { data } = res;
      message = `CSV successfully imported`;
      if (
        (data.importedRowCount || 0 === 0) &&
        (data.skippedRowCount === data.totalRowCount)
      ) {
        throw 'Your CSV import was not successful, and none of the data was imported';
      } else if (data.importedRowCount !== data.totalRowCount) {
        message = 'Your import was partially complete. ';
        const failedRows = [csvHeaders, ...data.failedRows];

        return {
          type: 'PARTIAL',
          message,
          failedRows,
        };
      }
    }

    return {
      type: 'ACCEPTED',
      message,
    }
  } catch (error) {
    const serverReason = error.message ? error.message : error;
    return {
      type: 'REJECTED',
      message: serverReason,
    }
  }
}
