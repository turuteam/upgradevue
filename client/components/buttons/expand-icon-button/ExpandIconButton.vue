<template>
    <div
      :class="[
        'expand-icon-button',
        text && 'enable-expansion',
        disabled && 'disabled',
        active && 'opened',
        parseInt(sideLength, 10) <= 40 && 'smaller',
      ]"
      @click="handleButtonClick"
    >
      <div class="icon" :style="{ height: sideLength, width: sideLength }">
        <ar-icon
          :name="iconName"
          :width="iconSize.width"
          :height="iconSize.height"
        />
      </div>
      <span v-if="text" class="text">
        {{ text }}
      </span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ExpandIconButton',
    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
      // loading: {
      //   type: Boolean,
      //   default: false,
      // },
      active: {
        type: Boolean,
        default: false,
      },
      iconName: {
        type: String,
        default: null,
      },
      iconSize: {
        type: Object,
        default: () => ({ height: '24px' }),
      },
      text: {
        type: String,
        default: null,
      },
      sideLength: {
        type: String,
        default: '50px',
      },
    },
    methods: {
      handleButtonClick(e) {
        e.stopPropagation();
        if (this.disabled) {
          return;
        }
        this.$emit('click');
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .expand-icon-button {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    background: $skyBlueGrey400;
    border-radius: 3px;
    cursor: pointer;
    transition: 0.3s all;
  
    &:hover, &.opened {
      background: $skyBlueGrey500;
    }
  
    .icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      color: $blueGrey700;
    }
  
    .text {
      display: inline-block;
      max-width: 0;
      color: $skyBlueGrey800;
      font-size: 14px;
      line-height: 1;
      transition: 0.3s all;
      font-weight: bold;
      overflow-x: hidden;
    }
  
    &.enable-expansion {
      &:hover, &.opened {
        .text {
          max-width: 110px;
          margin-right: 14px;
        }
      }
      &.smaller {
        &:hover, &.opened {
          .text {
            margin-right: 10px;
          }
        }
      }
    }
  }
  </style>
  