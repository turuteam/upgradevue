<template>
  <div
    :class="[
      'extended-sidebar-wrapper',
      $arMediaQuery.window.minWidth('md') && 'md-min',
      $arMediaQuery.window.maxWidth('md') && 'md-max',
      $arMediaQuery.window.maxWidth('xs') && 'xs-max',
      !layoutHasNoSidebar && 'with-sidebar'
    ]"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <div
      :class="[
        'extended-sidebar-content',
        $arMediaQuery.window.maxWidth('xs') && 'xs-max',
        !displaySegmentDrawer && 'hide',
        'layout-has-no-sidebar',
      ]"
      :style="{
        transition: displaySegmentDrawer ? 'transform 0.3s' : 'transform 0.01s',
      }"
    >
      <SegmentSection />
    </div>
    <div
      :style="{
        width: '100vw',
        transition: '0.01s all',
      }"
      :class="{ 'extended-sidebar-mask': true, hide: !displaySegmentDrawer }"
      @click="closeSidebar"
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import SegmentSection from './segment-section';

export default {
  name: 'ExtendedSidebar',

  components: {
    SegmentSection,
  },

  props: {
    layoutHasNoSidebar: {
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {
      lockedWindowScrollY: 0,
    };
  },
  computed: {
    ...mapState({
      displaySegmentDrawer: state => state.layout.displaySegmentDrawer,
    }),
  },

  methods: {
    ...mapMutations([
      'layout/TOGGLE_SEGMENT_DRAWER',
    ]),

    closeSidebar() {
      this['layout/TOGGLE_SEGMENT_DRAWER']({toggle: false});
    },
    handleScroll(e) {
      if (this.lockedWindowScrollY !== null && this.displaySegmentDrawer) {
        e.preventDefault();
        window.scrollTo(window.scrollX, this.lockedWindowScrollY);
      }
    },

    handleMouseOver() {
      this.lockedWindowScrollY = window.scrollY;
    },

    handleMouseLeave() {
      this.lockedWindowScrollY = null;
    },
  },

  created() {
    window.addEventListener('scroll', this.handleScroll);
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

};
</script>

<style lang="scss" scoped>
.extended-sidebar-wrapper {
  position: fixed;
  z-index: $zIndexGlobalHigh;
  left: 0;
  top: 0;
  height: 100vh;
  &.md-min.with-sidebar {
    left: 80px;
  }

  &.md-max {
    z-index: $zIndexGlobalRegular;
  }

  &.xs-max {
    left: 0;
  }

  .extended-sidebar-content {
    width: 360px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: $zIndexGlobalHighest;
    background: white;
    transform: translateX(0);
    border-right: 1px solid $skyBlueGrey500;

    &.xs-max {
      width: 100vw;
    }

    &.hide {
      transform: translateX(-100%);

      &.layout-has-no-sidebar {
        transform: translateX(calc(-100% - 80px));
      }
    }
  }

  .extended-sidebar-mask {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: $zIndexGlobalRegular;
    background: rgba(67, 81, 107, 0.6);
    transform: translateX(0);
    cursor: pointer;

    &.hide {
      transform: translateX(+100%);
    }
  }
}
</style>
