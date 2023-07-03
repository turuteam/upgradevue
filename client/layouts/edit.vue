<template>
  <main class="ar-edit-layout">
    <div
      ref="page-content"
      class="page-content"
    >
      <nuxt />
    </div>
    
    <SegmentExpansion layout-has-no-sidebar v-if="!isAdminAccount" />
    <ModalsExpansion>
      <portal-target name="modal" />
      <portal-target name="higher-order-modal" />
    </ModalsExpansion>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ModalsExpansion from '@/layouts/expansions/modals-expansion';
import SidebarExpansion from '@/layouts/expansions/sidebar-expansion';
import SegmentExpansion from '@/layouts/expansions/segment-expansion/';

export default defineNuxtComponent({
  name: 'EditLayout',

  middleware: 'authenticated',

  data() {
    return {
      leftSectionWidth: '0px',
    };
  },

  components: {
    ModalsExpansion,
    SidebarExpansion,
    SegmentExpansion,
  },

  created() {
    window.addEventListener('resize', this.updateMediaQuery);
    this.updateMediaQuery({
      windowWidth: window.innerWidth,
      pageContentWidth: window.innerWidth,
    });
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateMediaQuery);
  },

  watch: {
    displaySegmentDrawer: {
      handler: async function () {
        // Wait for next rerendering
        await this.$nextTick();

        this.updateMediaQuery();

        // Let's also dispatch 'resize' event since page content might change
        // If you have width transition of page content, make sure you increase the timeout
        // p.s: Our graphs listen to 'resize' event, so don't take this out
        setTimeout(this.dispatchResizeEvent, 100);
      },
      immediate: true,
    },
  },

  computed: {
    ...mapState({
      displaySegmentDrawer: state => state.layout.displaySegmentDrawer,
    }),
    ...mapGetters({
      isAdminAccount: 'auth/isAdminAccount',
    }),
  },

  methods: {
    updateLeftSectionWidth() {
      if (this.displaySegmentDrawer && (window.innerWidth >= this.$arMediaQuery.sizeMap.md.min)) {
        this.leftSectionWidth = '440px';
      } else if (window.innerWidth >= this.$arMediaQuery.sizeMap.md.min) {
        this.leftSectionWidth = '80px';
      } else {
        this.leftSectionWidth = '0px';
      }
    },
    updateMediaQuery() {
      this.updateLeftSectionWidth();
      this.$updateArMediaQuery({
        windowWidth: window.innerWidth,
        pageContentWidth: window.innerWidth - parseInt(this.leftSectionWidth, 10),
      });
    },
    dispatchResizeEvent() {
      window.dispatchEvent(new Event('resize'));
    },
  },
});
</script>

<style lang="scss" scoped>
.ar-edit-layout {
  position: relative;
  display: flex;

  .page-content {
    flex-grow: 1;
    min-width: 0;
  }
}
</style>
