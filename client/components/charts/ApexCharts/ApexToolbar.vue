<template>
    <div v-if="!withoutToolbar" class="toolbar-wrapper">
      <div class="toolbar-icon-wrapper">
        <am2-apex-toolbar-icon
          class="zoom-in-toolbar-icon"
          :fill="getFill('zoom-in')"
          icon="zoom-in"
          width="17px"
          :styles="{
            marginLeft: '5px',
          }"
          @click="handleIconClick"
          data-test-id="zoom-in-toolbar-icon"
        />
        <am2-apex-toolbar-icon
          class="zoom-out-toolbar-icon"
          :fill="getFill('zoom-out')"
          icon="zoom-out"
          width="17px"
          :styles="{
            marginLeft: '5px',
          }"
          @click="handleIconClick"
          data-test-id="zoom-out-toolbar-icon"
        />
        <am2-apex-toolbar-icon
          class="select-toolbar-icon"
          :fill="getFill('select')"
          icon="select"
          width="20px"
          height="15px"
          :styles="{
            marginLeft: '5px',
          }"
          @click="handleIconClick"
          data-test-id="select-toolbar-icon"
        />
        <am2-apex-toolbar-icon
          class="pan-toolbar-icon"
          :class="isCategoryType ? 'disabled' : ''"
          :fill="getFill('pan')"
          icon="pan"
          width="18px"
          :styles="{
            marginLeft: '5px',
          }"
          @click="handleIconClick"
          data-test-id="pan-toolbar-icon"
        />
        <am2-apex-toolbar-icon
          class="undo-toolbar-icon"
          :fill="getFill('undo')"
          icon="undo"
          width="20px"
          height="15px"
          :styles="{
            marginLeft: '5px',
          }"
          @click="handleIconClick"
          data-test-id="undo-toolbar-icon"
        />
      </div>
    </div>  
  </template>
  <script>
  export default {
    name: 'ApexToolbar',
    props: {
      withoutToolbar: {
        type: Boolean,
        default: false
      },
      chartId: {
        type: String,
        default: ''
      },
      selectedToolbarElement: {
        type: String,
        default: null,
      },
      isCategoryType: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      selectedToolbarElement() {
        if (this.selectedToolbarElement === 'undo') {
          setTimeout(() => {
            this.$emit('selection', 'select')
          }, 500)
        }
      }
    },
    methods: {
      getFill(selectedIcon) {
        if (this.selectedToolbarElement === selectedIcon) {
          return 'dodgerblue'
        } else {
          return 'gray'
        }
      },
      handleIconClick(iconName) {
        let el
  
        switch (iconName) {
          case 'zoom-in':
            el = document.querySelector(`#${this.chartId} .apexcharts-zoomin-icon`)
            this.$emit('selection', 'zoom-in')
            break
          case 'zoom-out':
            el = document.querySelector(`#${this.chartId} .apexcharts-zoomout-icon`)
            this.$emit('selection', 'zoom-out')
            break
          case 'select':
            el = document.querySelector(`#${this.chartId} .apexcharts-zoom-icon`)
            this.$emit('selection', 'select')
            break
          case 'pan':
            el = document.querySelector(`#${this.chartId} .apexcharts-pan-icon`)
            this.$emit('selection', 'pan')
            break
          case 'undo':
            el = document.querySelector(`#${this.chartId} .apexcharts-reset-icon`)
            this.$emit('selection', 'undo')
            break
          default:
            console.log('An unrecognised iconName was clicked on: ', iconName)
            return
        }
        if (iconName === 'zoom-in' || iconName === 'zoom-out') return
        
        if (!this.isCategoryType) {
          el.click()
        }
      },
    }
  }
  </script>
  <style lang="scss" scoped>
  .toolbar-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 7px;
    top: 0;
    height: 20px;
    z-index: 30;
    cursor: pointer;
    margin-right: 1%;
  
    .toolbar-icon-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
  
      .pan-toolbar-icon {
        &.disabled {
          pointer-events: none;
        }
      }
    }
  }
  </style>