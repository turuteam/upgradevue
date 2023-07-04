<template>
    <div :class="['ar-card-container', layout]">
      <slot />
    </div>
  </template>
  
  <script>
  export default {
    name: 'CardContainer',
    props: {
      layout: {
        type: String,
        default: 'regular',
        validator: item => {
          return ['regular', 'soft'].indexOf(item) > -1;
        }
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .ar-card-container {
    background-color: white;
    border: 1px solid $blueGrey500;
    border-radius: 4px;
  
    &.soft {
      border: 1px solid $skyBlueGrey400;
      box-shadow: $blueGrey400 2px 5px 10px;
      overflow:hidden;
    }
  }
  </style>
  