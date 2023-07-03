const openedModalMap = {};
const handleModalAction = async (modalAction, payload) => {
  // If this actions is being processed, then skip it.
  if (openedModalMap[modalAction]) {
    return Promise.resolve(false);
  }
  openedModalMap[modalAction] = true;
  const pushEvent = new CustomEvent('arModalOpen', {
    detail: {
      action: modalAction,
      payload,
    },
  });
  window.dispatchEvent(pushEvent);

  return new Promise((resolve) => {
    const handleResponse = (event) => {
      if (event.detail.action !== modalAction) {
        return;
      }
      openedModalMap[modalAction] = false;
      window.removeEventListener(`arModalResponse`, handleResponse);
      resolve(event.detail.payload);
    };
    window.addEventListener(`arModalResponse`, handleResponse);
  });
};
export async function OPEN_CANCELLATION_MODAL({}, payload) {
  return await handleModalAction('OPEN_CANCELLATION_MODAL', payload);
};
export async function OPEN_IMPORT_CONTACTS_MODAL({}, payload) {
  return await handleModalAction('OPEN_IMPORT_CONTACTS_MODAL', payload);
};
export async function OPEN_IMPORT_EVENT_DATA_MODAL({}, payload) {
  return await handleModalAction('OPEN_IMPORT_EVENT_DATA_MODAL', payload);
};

export async function OPEN_IMPORT_PRODUCT_DATA_MODAL({}, payload) {
  return await handleModalAction('OPEN_IMPORT_PRODUCT_DATA_MODAL', payload);
};

export async function OPEN_FAILED_IMPORT_MODAL({}, payload) {
  return await handleModalAction('OPEN_FAILED_IMPORT_MODAL', payload);
};
export async function SHOW_MULTIPLE_BUTTON_MODAL({}, payload) {
  return await handleModalAction('SHOW_MULTIPLE_BUTTON_MODAL', payload);
};
export async function SHOW_CONFIRM({}, payload) {
  return await handleModalAction('SHOW_CONFIRM', payload);
};
