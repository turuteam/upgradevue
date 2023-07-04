<template>
    <div class="avatar-button" @click="handleClick">
      <ar-avatar
        class="avatar"
        v-bind="avatarProps"
      />
      <div v-if="sideText && sideText.text && sideText.style">
        <ar-text
          class="side-text"
          size="sm"
          weight="bold"
          :line-height="sideText.style.lineHeight || '30px'"
          :style="{
            ...sideText.style
          }"
          :text="sideText.text"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'IconButton',
  
    props: {
      avatarProps: {
        type: Object,
        default: () => {},
      },
      sideText: {
        type: Object,
        default: () => {},
      }
    },
  
    methods: {
      handleClick(e) {
        e.stopPropagation();
        this.$emit('click');
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .avatar-button {
    display: inline-flex;
  
    .avatar {
      cursor: pointer;
  
      &:hover {
        background: $skyBlueGrey500;
      }
    }
  }
  </style>
  