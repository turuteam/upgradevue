<template>
    <am2-mobile-container
      class="message-mobile-container"
      :has-footer="false"
      size="fullHeight"
    >
      <slot />
      <div
        v-if="displayPaginator && contactsCount"
        class="footer-section"
      >
        <PreviewContactsPaginator
          :max="contactsCount - 1"
          :value="realVal"
          @input="handleIndexInput"
          data-value="tags-paginator-previous-button"
        />
      </div>
    </am2-mobile-container>
  </template>
  
  <script>
  export default {
    props: {
      displayPaginator: {
        type: Boolean,
        default: false,
      },
      contactsCount: {
        type: Number,
        default: 0,
      },
      contactIndex: {
        type: Number,
        default: null,
      },
    },
  
    data() {
      return {
        realVal: this.contactIndex,
      };
    },
  
    watch : {
      contactIndex(newVal) {
        this.realVal = newVal;
      },
    },
  
    methods: {
      handleIndexInput(newVal) {
        this.realVal = newVal;
        this.$emit('contactChange', newVal);
      },
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .message-mobile-container {
    .footer-section {
      background: rgba(256, 256, 256, 0.7);
    }
  }
  </style>
  