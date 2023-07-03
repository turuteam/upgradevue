<template>
  <main :class="[
        'default-layout',
        $arMediaQuery.window.maxWidth('sm') && 'sm-max',
      ]">
    <SidebarExpansion />
    <SegmentExpansion v-if="!isAdminAccount" />
    <ModalsExpansion>
      <portal-target name="modal" />
      <portal-target name="higher-order-modal" />
    </ModalsExpansion>
    <div
      :class="[
        'left-section',
      ]"
      :style="{
        width: leftSectionWidth,
      }"
    />
    <div
      ref="page-content"
      :class="[
        'page-content',
        $arMediaQuery.window.maxWidth('sm') && 'sm-max',
      ]"
    >
      <NotAccessiblePage
        v-show="!isPageAccessible"
        :feature-name="notAccessibleFeature"
      />
      <div
        v-show="isPageAccessible"
      >
        <nuxt />
      </div>
    </div>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import NotAccessiblePage from '@/pages/exceptions/not-accessible';
import ModalsExpansion from '@/layouts/expansions/modals-expansion';
import SidebarExpansion from '@/layouts/expansions/sidebar-expansion';
import SegmentExpansion from '@/layouts/expansions/segment-expansion/';

export default defineNuxtComponent({
  name: 'DefaultLayout',

  components: {
    NotAccessiblePage,
    ModalsExpansion,
    SidebarExpansion,
    SegmentExpansion,
  },

  middleware: 'authenticated',

  data() {
    return {
      hasInitializedHubspot: false,
      isPageAccessible: true,
      notAccessibleFeature: null,
      leftSectionWidth: '0px',
    };
  },

  computed: {
    ...mapState({
      displaySegmentDrawer: state => state.layout.displaySegmentDrawer,
      accessibility: state => state.accessibility,
    }),
    ...mapGetters({
      isAdminAccount: 'auth/isAdminAccount',
    }),
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
    // Ideally we will drop this accessibiliy thing after every page has empty state
    accessibility: {
      handler(newValue) {
        if (this.updatePageAccessibilityTimeout) {
          clearTimeout(this.updatePageAccessibilityTimeout);
        }
        // Reason why we have timeout here is because when page status is changed
        // from not available to available, the not accessible page will be displayed
        // in a very short time and then jump to new page. (We will totally remove this in payment phase 2)
        if (newValue.accessible) {
          this.updatePageAccessibilityTimeout = setTimeout(() => {
            this.updatePageAccessibility(newValue);
          }, 50);
        } else {
          this.updatePageAccessibility(newValue);
        }
      },
      deep: true,
    },
  },

  created() {
    window.addEventListener('resize', this.updateMediaQuery);
    this.updateMediaQuery();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateMediaQuery);
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
    // Ideally we will drop this updatePageAccessibility function after every page has empty state
    updatePageAccessibility(newValue) {
      this.isPageAccessible = newValue.accessible;
      this.notAccessibleFeature = newValue.noAccessibilityTo;
    },
    dispatchResizeEvent() {
      window.dispatchEvent(new Event('resize'));
    },
  },
});
</script>

<style lang="scss" scoped>
.default-layout {
  position: relative;
  display: flex;

  &.sm-max {
    padding-top: $sidebar_header_height; // Push content down on mobile and tablet to make space for mobile header
  }

  .left-section {
    position: relative;
    height: 100vh;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .page-content {
    flex-grow: 1;
    min-width: 0;

    &.sm-max {
      max-width: 100vw;
      padding: 0 0 80px 0;
    }
  }
}
</style>
