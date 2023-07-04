<template>
    <div
      ref="mobile-container"
      class="mobile-container"
      :style="mobileContainerStyle"
    >
      <div class="mobile-content-wrapper">
        <div
          class="mobile-content"
        >
          <div
            class="mobile-content-body"
            :style="scaleStyle"
          >
            <div v-if="websiteUrl" class="website-url">
              <ar-icon class="icon" name="lock" width="7px" />
              <ar-text
                class="url-text"
                size="xxxs"
                :text="websiteUrl"
              />
            </div>
            <div
              :class="[
                'web-content',
                websiteUrl && 'has-website-url',
              ]"
            >
              <slot />
            </div>
          </div>
          <div class="mobile-content-footer">
            <slot name="inner-fixed-footer" />
          </div>
        </div>
      </div>
      <ar-text
        v-if="hasFooter"
        size="xs"
        class="preview-footer"
        text="Mobile preview"
      />
    </div>
  </template>
  
  <script>
  export default {
    name: 'MobileContainer',
  
    props: {
      websiteUrl: {
        type: String,
        default: null,
      },
      hasFooter: {
        type: Boolean,
        default: true,
      },
      size: {
        type: String,
        default: 'fixed',
        validator: (val) =>
          ['fixed', 'fullHeight', 'fullWidth'].indexOf(val) > -1,
      },
    },
  
    data() {
      return {
        scale: 1,
        fixedWidth: 395,
        fixedHeight: 780,
        containerWidth: 0,
        containerHeight: 0,
      };
    },
  
    computed: {
      mobileContainerStyle() {
        if (this.size === 'fullHeight') {
          return {
            width: `${this.containerWidth}px`,
            height: '100%',
          };
        } else if (this.size === 'fullWidth') {
          return {
            width: '100%',
            height: `${this.containerHeight}px`,
          };
        } else {
          // by default, this.size = 'fixed', which should yield this style
          return {
            width: `${this.containerWidth}px`,
            height: `${this.containerHeight}px`,
          };
        }
  
  
      },
      scaleStyle() {
        return {
          width: `${100 / this.scale}%`,
          height: `${100 / this.scale}%`,
          transform: `scale(${this.scale})`,
          transformOrigin: 'top left',
        };
      },
    },
  
    mounted() {
      this.containerResizeObserver = new ResizeObserver(() => {
        this.handleMobileContainerResize();
      });
      this.containerResizeObserver.observe(this.$refs['mobile-container']);
  
      this.handleMobileContainerResize();
    },
  
    beforeDestroy() {
      this.containerResizeObserver.unobserve(this.$refs['mobile-container']);
    },
  
    methods: {
      getMobileContainerElem() {
        return this.$refs['mobile-container'];
      },
      calculateScale() {
        if (!this.getMobileContainerElem()) {
          return;
        }
        if (this.size === 'fixed' || this.getMobileContainerElem().offsetWidth > this.fixedWidth) {
          this.scale = '1.0000';
        } else {
          this.scale = parseFloat(this.containerWidth / this.fixedWidth).toFixed(4);
        }
      },
      calculateMobileSize() {
        if (!this.getMobileContainerElem()) {
          return;
        }
        if (this.size === 'fixed') {
          this.containerWidth = this.fixedWidth;
          this.containerHeight = this.fixedHeight;
        } else if (this.size === 'fullHeight') {
          this.containerWidth = this.getMobileContainerElem().offsetHeight * ( this.fixedWidth / this.fixedHeight );
          this.containerHeight = this.getMobileContainerElem().offsetHeight;
        } else if (this.size === 'fullWidth') {
          this.containerWidth = this.getMobileContainerElem().offsetWidth;
          this.containerHeight = this.getMobileContainerElem().offsetWidth * ( this.fixedHeight / this.fixedWidth );
        }
      },
      handleMobileContainerResize() {
        this.$nextTick(() => {
          this.calculateMobileSize();
          this.calculateScale();
        });
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .mobile-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  
    .mobile-content-wrapper {
      position: relative;
      background-image: url('~assets/images/campaigns/mobile-preview-pane.svg');
      background-size: cover;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index:$zIndexHighest;
  
      // Cuz we have mobile background
      padding: 15% 2.6% 15.6% 2.45%;
  
      .mobile-content {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        overflow: hidden;
  
        .mobile-content-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          .website-url {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 30px;
            background: #fff;
            padding: 0 10px;
            .icon {
              color: $skyBlueGrey700;
              margin-right: 4px;
            }
            .url-text {
              max-width: calc(100% - 11px);
              color: #54657E;
            }
          }
  
          .web-content {
            height: 100%;
            &.has-website-url {
              height: calc(100% - 30px);
            }
          }
        }
        .mobile-content-footer {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
        }
      }
    }
  
    .preview-footer {
      position: absolute;
      bottom: -17px;
      transform: translateY(100%);
      color: #9FA8B5;
      z-index:$zIndexHigh;
    }
  }
  </style>
  
  