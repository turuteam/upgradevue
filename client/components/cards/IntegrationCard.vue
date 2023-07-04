<template>
    <am2-card-container
      :style="{ padding: $arMediaQuery.pageContent.maxWidth('sm') ? '20px' : '24px 30px' }"
      layout="soft"
    >
      <section :class="[
        'integration',
        $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
        $arMediaQuery.pageContent.minWidth('sm') && 'sm-min',
      ]">
        <div :class="[
          'left-section',
          $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
          $arMediaQuery.pageContent.maxWidth('xs') && 'xs-max',
          $arMediaQuery.pageContent.minWidth('sm') && 'sm-min',
        ]">
          <div class="left-section-item u-align-items-center">
            <div class="icon">
              <slot name="logo-icon">
                <am2-provider-icon
                  :name="logoIconName"
                  :color="logoColor"
                  height="40px"
                />
              </slot>
            </div>
            <div
              class="context"
              :style="{
                height: $arMediaQuery.pageContent.minWidth('lg') && '44px',
              }"
            >
              <am2-heading
                type="h1"
                size="sm"
                :title="title"
                weight="bold"
                :align="$arMediaQuery.pageContent.minWidth('sm') ? 'left' : 'center'"
              />
              <ar-text
                class="description"
                size="xs"
                :text="description"
                :align="$arMediaQuery.pageContent.maxWidth('xs') ? 'center' : 'left'"
                multiple-lines
              />
            </div>
          </div>
  
          <div v-if="smallImages" class="left-section-item">
            <div class="icon">
              <!-- empty -->
            </div>
            <div class="context">
              <!-- multiple-lines -->
              <div class="display-images-section">
                <div
                  v-for="(img, idx) of displayedImages"
                  :key="idx"
                  class="overlap-image-wrapper"
                  :style="{ zIndex: displayedImages.length - idx }"
                >
                  <img
                    class="overlap-image"
                    :src="img.src" />
                </div>
                <am2-heading
                  :class="[
                  'images-section-subtitle',
                  $arMediaQuery.pageContent.maxWidth('sm') && 'u-display-none',
                ]"
                  type="h2"
                  size="xs"
                  :title="smallImagesSubtitle"
                />
              </div>
            </div>
          </div>
        </div>
        <div :class="[
          'right-section',
          $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
          $arMediaQuery.pageContent.maxWidth('xs') && 'xs-max',
        ]">
          <am2-tag
            v-if="failed && !loading"
            text="Deauthorised"
            :class="[
              'failed-tag',
              $arMediaQuery.pageContent.maxWidth('sm') && 'u-display-none',
            ]"
            type="red"
          />
          <ar-simple-button
            :outlined="connected"
            :text="connected ? 'Manage'
                    : failed ? 'Reconnect' : 'Connect'"
            :loading="loading"
            :disabled="disabled"
            @click="handleButtonClick"
          />
        </div>
      </section>
    </am2-card-container>
  </template>
  
  <script>
  export default {
    name: 'IntegrationCard',
  
    props: {
      title: {
        type: String,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
      logoIconName: {
        type: String,
        default: null,
      },
      logoColor: {
        type: String,
        default: null,
      },
      smallImages: {
        type: Array,
        default: null,
      },
      connected: {
        type: Boolean,
        default: false,
      },
      failed: {
        type: Boolean,
        default: false,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
  
    computed: {
      smallImagesSubtitle() {
        if (this.smallImages.length === 0) {
          return null;
        }
        if (this.smallImages.length === 1) {
          return this.smallImages[0].name;
        }
        return `${this.smallImages[0].name} & ${this.smallImages.length - 1} other pages connected`;
      },
      displayedImages() {
        return this.smallImages.slice(0, 10);
      },
    },
  
    methods: {
      handleButtonClick() {
        if (this.loading) {
          return;
        }
        this.$emit(this.connected ? 'manage' : 'connect');
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
    @import '../../../assets/styles/base/mixins';
  .integration {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  
    &.center-align {
      align-items: center;
    }
  
    &.sm-max {
      flex-direction: column;
    }
  
    &.sm-min {
      flex-direction: row;
    }
  
    .right-section {
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
  
      .failed-tag {
        margin: 0 14px;
      }
  
      .icon {
        color: $blueGrey700;
      }
  
      &.sm-max {
        max-width: calc(100% - 50px);
        margin-top:16px;
        align-self: flex-end;
      }
  
      &.xs-max {
        align-self:center;
      }
    }
  
    .left-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
  
      .left-section-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-shrink: 1;
        max-width: calc(100%);
        justify-content: space-between;
      }
  
      .icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        width: 40px;
        margin-right: 29px;
      }
  
      .context {
        flex-shrink: 1;
  
        .description {
          color: $blueGrey700;
          margin: 11px 0 0;
        }
  
        .display-images-section {
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 22px;
          padding-left: 10px;
          z-index: $zIndexRegular;
  
          .overlap-image-wrapper {
            position: relative;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background: white;
            margin-left: -10px;
  
            .overlap-image {
              width: 30px;
              height: 30px;
              border-radius: 15px;
            }
          }
  
          .images-section-subtitle {
            margin-left: 12px;
            color: $blueGrey700;
          }
        }
      }
  
      &.xs-max {
        flex-direction:column;
        align-items: center;
        align-self: center;
        .icon {
          margin-right:0;
          margin-bottom:16px;
        }
        .context {
          max-width: calc(100% - 50px);
        }
      }
  
      &.sm-max {
        max-width:100%;
        .context {
          max-width: calc(100% - 50px);
        }
  
        .left-section-item {
          margin-bottom: 5px;
        }
      }
  
      &.sm-min {
        max-width: calc(100% - 100px);
      }
    }
  }
  </style>
  