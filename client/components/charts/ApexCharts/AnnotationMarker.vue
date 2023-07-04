<template>
    <div 
      class="annotation-marker"
      :style="{ ...styles }"
      @mouseover="handleMouseOver"
      @mouseleave="handleMouseLeave"
      :data-test-id="`annotation-marker-${styles.left}`"
    >
      <div class="annotation-marker-inner" />
    </div>
  </template>
  <script>
  export default {
    name: 'AnnotationMarker',
    props: {
      styles: {
        type: Object,
        default: null
      }
    },
    methods: {
      handleMouseOver() {
        this.$emit('mouseover')
      },
      handleMouseLeave() {
        this.$emit('mouseleave')
      },
    }
  }
  </script>
  <style lang="scss" scoped>
  .annotation-marker {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 20px;
    border: 1px solid white;
    position: absolute;
    bottom: 23px;
    cursor: pointer;
  
    .annotation-marker-inner {
      background: white;
      width: 6px;
      height: 6px;
      border-radius: 10px;
    }
  }
  </style>