import { mapActions } from 'vuex';

export default function ({ featureKeys, featureName, skip = false }) {
  return {
    created() {
      if (!skip) {
        this.CHECK_PAGE_ACCESSIBILITY({ featureKeys, featureName });
      }
    },

    beforeDestroy() {
      // Remember to reset it, cuz not every page has this mixin.
      this.RESET_PAGE_ACCESSIBILITY();
    },

    methods: {
      ...mapActions([
        'CHECK_PAGE_ACCESSIBILITY',
        'RESET_PAGE_ACCESSIBILITY'
      ]),
    },
  }
} 