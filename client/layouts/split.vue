<template>
  <main class="ar-split-layout">
    <div
      v-if="this.$arMediaQuery.window.minWidth('sm')"
      :class="[
        'left-section',
      ]"
    >
      <div
        class="background-image"
        :style="{
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: backgroundSize,
        }"
      />
    </div>
    <div
      ref="page-content"
      :class="[
        'page-content',
        this.$arMediaQuery.window.maxWidth('sm') && 'full-width',
      ]"
    >
      <nuxt />
    </div>

    <div
      class="logo-wrapper"
      :style="{
        background: this.$arMediaQuery.window.maxWidth('sm') ? 'rgba(256, 256, 256, 0.9)' : null,
        position: this.$arMediaQuery.window.maxWidth('sm') ? 'absolute' : 'fixed',
      }"
    >
      <ar-icon
        :name="!this.$arMediaQuery.window.maxWidth('sm') ? 'ar-logo-mono' : 'ar-logo'"
        width="35px"
        height="31px"
        color="white"
      />
    </div>
    <ModalsExpansion>
      <portal-target name="modal" />
      <portal-target name="higher-order-modal" />
    </ModalsExpansion>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import ModalsExpansion from '@/layouts/expansions/modals-expansion';

import BackgroundImageOne from '@/assets/images/login/background-1-transparent.png';
import BackgroundImageTwo from '@/assets/images/login/background-2-transparent.png';
import BackgroundImageThree from '@/assets/images/login/background-3-transparent.png';

export default {
  name: 'SplitLayout',

  middleware: 'authenticated',

  components: {
    ModalsExpansion,
  },

  computed: {
    ...mapState({
      imageIndex: state => state.layout.imageIndex,
    }),

    backgroundImage() {
      let backgroundImage;
      switch (this.imageIndex) {
        case 1:
          backgroundImage = BackgroundImageOne;
          break;
        case 2:
          backgroundImage = BackgroundImageTwo;
          break;
        case 3:
          backgroundImage = BackgroundImageThree;
          break;
        default:
          backgroundImage = BackgroundImageOne;
          break;
      }
      return backgroundImage;
    },

    backgroundSize() {
      let backgroundSize;
      switch (this.imageIndex) {
        case 1:
          backgroundSize = '60%';
          break;
        case 2:
          backgroundSize = '100%';
          break;
        case 3:
          backgroundSize = '100%';
          break;
        default:
          backgroundSize = '100%';
          break;
      }
      return backgroundSize;
    }
  },

  created() {
    window.addEventListener('resize', this.updateMediaQuery);
    this.updateMediaQuery();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateMediaQuery);
  },

  methods: {
    updateMediaQuery() {
      const windowWidth = window.innerWidth;
      const pageContentWidth = window.innerWidth > this.$arMediaQuery.sizeMap.sm.max ? parseInt(window.innerWidth / 2) : windowWidth;
      this.$updateArMediaQuery({
        windowWidth,
        pageContentWidth,
      });
    },
    dispatchResizeEvent() {
      window.dispatchEvent(new Event('resize'));
    },
  },
};
</script>

<style lang="scss" scoped>
.ar-split-layout {
  position: relative;
  display: flex;

  .logo-wrapper {
    position: fixed;
    top: 37px;
    left: 35px;
    z-index: $zIndexHigh;
    display: inline-flex;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
  }

  .left-section {
    position: fixed;
    top: 0;
    left: 0;
    width: 50vw;
    height: 100vh;
    background-image: linear-gradient(90deg, #3023AE 0%, #3A28B0 5%, #613BBB 23%, #6B40BE 28%, #7042BF 30%, #7B48C2 36%, #C86DD7 72%, #ed8eec 100%);

    .background-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }
  }

  .page-content {
    width: 50vw;
    margin-left: 50vw;

    &.full-width {
      width: 100vw;
      margin-left: 0;
    }
  }
}
</style>
