<template>
  <section
    v-show="show"
    :class="[
      'ar-feature-mask',
      showUpgradeOn === 'hover' && 'show-upgrade-on-hover',
      showUpgradeOn === 'always' && 'show-upgrade-on-always',
    ]"
    :style="wrapperStyle"
    @click="handleSectionClick"
  >
    <div v-if="mode !== 'transparent'" class="lock-icon-wrapper">
      <ar-icon
        width="28px"
        name="lock"
        color="white"
      />
    </div>
    <am2-card-container
      v-if="mode !== 'transparent'"
      class="modal-wrapper"
    >
      <ar-icon
        v-if="iconName"
        :name="iconName"
        :color="$arStyle.color.purple500"
        :wrapper-style="{
          display: 'inline-flex',
          alignItem: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: $arStyle.color.skyBlueGrey300,
        }"
        class="u-margin-bottom-5"
      />
      <ar-text
        size="sm"
        :text="title"
        weight="bold"
      />
      <ar-text
        class="message"
        size="xs"
        :text="message"
        multiple-lines
        allow-html
        line-height="25px"
        align="center"
      />
      <ar-simple-button
        text="Upgrade now"
        icon-name="lock"
        :icon-props="{
          width: '14px',
        }"
        :style="{
          marginTop: '26px',
        }"
        type="green"
        @click="handleUpgradeClick"
      />
    </am2-card-container>
  </section>
</template>

<script>
export default {
  name: 'FeatureLockerSection',
  props: {
    mode: {
      type: String,
      default: 'default',
      validator: (val) => ['default', 'transparent'].indexOf(val) > -1,
    },
    show: {
      type: Boolean,
      default: null,
    },
    showUpgradeOn: {
      type: String,
      default: 'hover',
      validator: (val) => ['hover', 'always'].indexOf(val) > -1,
    },
    iconName: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    margin: {
      type: Object,
      default: () => ({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }),
      validator: (val) => { // Make sure
        return val
          && typeof val.top === 'number'
          && typeof val.right === 'number'
          && typeof val.bottom === 'number'
          && typeof val.left === 'number';
      },
      errorMessage: 'Either provide null or complete margin object with "top", "right", "bottom", "left" in form of Number',
    },
  },
  data() {
    return {
      store: null, // We inject our vuex $store here, since this component won't be bound with Vuex by default
      router: null, // We inject our Vue-router $router here, since this component won't be bound with Vue-Router by default
    };
  },
  computed: {
    wrapperStyle() {
      return {
        top: this.margin.top,
        left: this.margin.left,
        width: `calc(100% - ${this.margin.left} - ${this.margin.right})`,
        height: `calc(100% - ${this.margin.top} - ${this.margin.bottom})`,
        opacity: this.mode === 'transparent' ? 0 : 1,
      };
    },
  },
  methods: {
    injectDependencies({
      $store,
      $router,
    }) {
      this.store = $store;
      this.router = $router;
    },
    async showUpgradeConfirmModal() {
      const ans = await this.store.dispatch('SHOW_CONFIRM', {
        title: this.title,
        messageHtml: this.message,
        hideCancelButton: true,
        confirmButtonText: 'Done',
      });
      if (!ans) {
        return;
      }
      // After we have payment page
      // this.$router.push('/payment');
    },
    handleUpgradeClick() {
      if (this.mode !== 'default') {
        return;
      }
      this.router.push('/plans');
    },
    async handleSectionClick(event) {
      event.stopPropagation();
      if (this.mode !== 'transparent') {
        return;
      }
      this.showUpgradeConfirmModal();
    },
  },
};
</script>

<style lang="scss" scoped>
.ar-feature-mask {
  position: absolute;
  display: flex;
  overflow: hidden;
  background: rgba($blueGrey800, 0.6);
  z-index: $zIndexHighest;
  cursor: pointer;

  .lock-icon-wrapper {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    transform: translateX(-50%) translateY(-50%);
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    z-index: $zIndexRegular;
  }

  .modal-wrapper {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: calc(100% - 40px);
    margin: 0 auto;
    max-width: 740px;
    padding: 40px 30px;
    z-index: $zIndexHigh;
    opacity: 0;
    transition: all 0.05s;

    .message {
      margin-top: 10px;
    }
  }

  &.show-upgrade-on-hover {
    &:hover {
      .modal-wrapper {
        opacity: 1;
      }
    }
  }

  &.show-upgrade-on-always {
    .modal-wrapper {
      opacity: 1;
    }
  }
}
</style>
