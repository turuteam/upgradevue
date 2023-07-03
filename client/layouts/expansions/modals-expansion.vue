<template>
  <div>
    <slot />
    <GlobalWarningModal />
    <ImportContactsModal v-if="isLoggedIn" />
    <ImportEventDataModal v-if="isLoggedIn" />
    <ImportProductDataModal v-if="isLoggedIn" />
    <FailedImportModal v-if="isLoggedIn" />
    <CancellationModal v-if="isLoggedIn" />
    <MultipleButtonModal v-if="isLoggedIn" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import GlobalWarningModal from '@/components/modals/general/global-warning-modal/';
import MultipleButtonModal from '@/components/modals/general/multiple-button-modal/';
import CancellationModal from '@/components/modals/general/cancellation-modal/CancellationModal';
import ImportContactsModal from '@/components/modals/audience/import-contacts-modal/';
import ImportEventDataModal from '@/components/modals/event/import-event-data-modal/';
import ImportProductDataModal from '@/components/modals/event/import-product-data-modal/';
import FailedImportModal from '@/components/modals/event/failed-rows/';

export default {
  name: 'ModalsExpansion',
  components: {
    GlobalWarningModal,
    ImportContactsModal,
    ImportEventDataModal,
    ImportProductDataModal,
    FailedImportModal,
    CancellationModal,
    MultipleButtonModal,
  },
  computed: {
    ...mapState({
      account: state => state.auth.account,
    }),
    isLoggedIn() {
      if (!this.account) {
        return false;
      }
      return Object.keys(this.account).length > 0;
    },
  },
};
</script>
