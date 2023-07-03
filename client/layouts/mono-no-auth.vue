<template>
  <main class="ar-mono-layout">
    <div
      ref="page-content"
      class="page-content"
    >
      <nuxt />
    </div>
    <ModalsExpansion>
      <portal-target name="modal" />
      <portal-target name="higher-order-modal" />
    </ModalsExpansion>
  </main>
</template>

<script>
import ModalsExpansion from '@/layouts/expansions/modals-expansion';

export default defineNuxtComponent({
  name: 'MonoNoAuthLayout',

  components: {
    ModalsExpansion,
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
      this.$updateArMediaQuery({
        windowWidth: window.innerWidth,
        pageContentWidth: window.innerWidth,
      });
    },
    dispatchResizeEvent() {
      window.dispatchEvent(new Event('resize'));
    },
  },
});
</script>

<style lang="scss" scoped>
.ar-mono-layout {
  position: relative;
  display: flex;

  .page-content {
    flex-grow: 1;
    min-width: 0;
  }
}
</style>
