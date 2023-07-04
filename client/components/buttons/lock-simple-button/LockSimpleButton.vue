<template>
    <ar-simple-button
      icon-name="lock"
      :icon-props="{
        width: '14px',
      }"
      :text="text"
      :shape="shape"
      :type="type"
      :outlined="outlined"
      :transparent="transparent"
      icon-distance="10px"
      class="ar-lock-simple-button"
      @click="handleButtonClick"
    />
  </template>
  
  <script>
  export default {
    name: 'LockSimpleButton',
    props: {
      text: {
        type: String,
        default: null,
      },
      shape: {
        type: String,
        default: 'rounded-rectangle',
        validator: (value) =>
          ['rounded-rectangle', 'pill'].indexOf(value) !== -1,
      },
      type: {
        type: String,
        default: 'primary',
        validator: (value) => ['purple', 'gradient-purple', 'grey', 'green', 'red', 'messenger'].indexOf(value) !== -1,
      },
      outlined: {
        type: Boolean,
        default: false,
      },
      transparent: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      handleButtonClick(e) {
        e.stopPropagation();
        e.preventDefault();
        this.$emit('click');
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .ar-lock-simple-button {
    cursor: not-allowed;
  }
  </style>
  