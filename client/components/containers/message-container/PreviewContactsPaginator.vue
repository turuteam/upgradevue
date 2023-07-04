<template>
    <div class="dynamic-tags-paginator">
      <ar-icon-button
        :icon-props="{
          name: 'arrow',
          rotate: 90,
        }"
        @click="handlePreviousClick"
        data-test-id="tags-paginator-previous-button"
      />
      <ar-text
        size="10px"
        :text="currentPageCopy"
        :style="{
          color: '#9FA8B5',
        }"
      />
      <ar-icon-button
        :icon-props="{
          name: 'arrow',
          rotate: -90,
        }"
        @click="handleNextClick"
        data-test-id="tags-paginator-next-button"
      />
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        realVal: 0,
      };
    },
    computed: {
      currentPageCopy() {
        return `PREVIEW ${this.realVal + 1} OF ${this.max + 1}`;
      },
    },
    watch: {
      value: {
        handler(newVal) {
          this.realVal = newVal;
        },
        immediate: true,
      },
    },
    methods: {
      handlePreviousClick() {
        if (this.realVal - 1 < 0) {
          return;
        }
        this.realVal = this.realVal - 1;
        this.$emit('input', this.realVal);
      },
      handleNextClick() {
        if (this.realVal + 1 > this.max) {
          return;
        }
        this.realVal = this.realVal + 1;
        this.$emit('input', this.realVal);
      },
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .dynamic-tags-paginator {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  </style>
  