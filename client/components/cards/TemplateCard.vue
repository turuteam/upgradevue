<template>
    <am2-card-container
      ref="template-card"
      :class="['template-card', disabled && 'disabled']"
      @click.prevent="handleCardClick"
      :data-test-id="dataTestId"
    >
      <am2-icon-button-dropdown
        v-if="displayedActionItems.length > 0"
        :items="displayedActionItems"
        :dropdown-style="{
          width: '200px',
        }"
        :dropdown-item-style="{
          height: '41px',
          padding: '0 20px',
        }"
        class="menu-dropdown"
        @select="handleDropdownActionClick"
      />
      <div class="upper-section">
        <div
          ref="email-review-box"
          class="email-review-box"
        >
          <div
            v-if="!!thumbnailUrl"
            class="email-iframe-wrapper"
            :style="thumbnailStyle"
          />
          <div
            v-else-if="loadedHtmlString"
            class="email-iframe-wrapper"
            :style="scaleStyle"
          >
            <iframe
              :src="loadedHtmlString"
              loading="lazy"
              class="email-iframe"
              width="100%"
              height="100%"
              frameborder="0"
              scrolling="no"
              :style="{
                opacity: hasLoadedHtml ? '1' : '0',
              }"
              @load="handleIframeLoad"
            />
          </div>
          <div
            v-if="!templateHtml"
            class="email-review-box-loading"
          />
        </div>
      </div>
      <div class="lower-section">
        <ar-text
          class="email-template-title"
          size="xs"
          :text="name"
          weight="bold"
          multiple-lines
          :max-lines="2"
          align="center"
        />
        <ar-text
          class="email-template-description"
          size="xxs"
          :text="description"
          multiple-lines
          :max-lines="3"
          align="center"
          :style="{
            color: $arStyle.color.skyBlueGrey700,
          }"
        />
      </div>
    </am2-card-container>
  </template>
  
  <script>
  import { createBlob } from '@/utils/html-element'
  const expectedMobileSize = 395;
  
  export default {
    name: 'TemplateCard',
    props: {
      allowedActions: {
        type: Array,
        default: () => [],
      },
      name: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      template: {
        type: [Object, String],
        default: null,
      },
      templateHtml: {
        type: String,
        default: '',
      },
      type: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      thumbnailUrl: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        hasLoadedHtml: false,
        actionItems: [
          {
            name: 'Send a message',
            value: 'sendMessage', 
          },
          {
            name: 'Create new template',
            value: 'createTemplate', 
          },
          {
            name: 'Edit template',
            value: 'edit', 
          },
          {
            name: 'Rename template',
            value: 'rename',
          },
          {
            name: 'Delete',
            value: 'delete',
            typography: {
              style: {
                color: this.$arStyle.color.red500,
              },
            },
          },
        ],
        scale: 0.3,
        loadedHtmlString: null,
      };
    },
    computed: {
      dataTestId() {
        return this.$arUtils.general.generateDataTestPrettyName(this.name);
      },
      scaleStyle() {
        return {
          width: `${100 / this.scale}%`,
          height: `${100 / this.scale}%`,
          transform: `scale(${this.scale})`,
          transformOrigin: 'top left',
        };
      },
      thumbnailStyle() {
        return {
          width: `${100 / this.scale}%`,
          height: `${100 / this.scale}%`,
          transform: `scale(${this.scale})`,
          transformOrigin: 'top left',
          backgroundImage: `url("${this.thumbnailUrl}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
        };
      },
      displayedActionItems() {
        return this.actionItems.filter(item => this.allowedActions.indexOf(item.value) > -1);
      },
    },
    methods: {
      updateScale() {
        if (!this.$refs['email-review-box']) {
          return;
        }
        const { width } = this.$refs['email-review-box'].getBoundingClientRect();
        this.scale = width / 395;
      },
      handleDropdownActionClick(item) {
        this.$emit(item.value);
      },
      handleCardClick() {
        if (this.disabled) {
          return;
        }
        this.$emit('click');
      },
      handleIframeLoad() {
        this.hasLoadedHtml = true
      },
      async localTemplateHtmlUrl() {
        // We don't have to generate HTML URL if there is a thumbnail
        if (!this.templateHtml || !!this.thumbnailUrl) {
          return null;
        }
  
        let htmlString = this.templateHtml
  
        if (this.type === "beefree") {
          htmlString = await this.$api.beefree.exportHtml(this.templateHtml)
        }
  
        this.loadedHtmlString = URL.createObjectURL(createBlob({ text: htmlString, type: 'text/html' }))
      },
    },
    mounted() {
      this.templateResizeObserver = new ResizeObserver((entries) => {
        this.updateScale();
      });
      this.templateResizeObserver.observe(this.$refs['email-review-box']);
      this.localTemplateHtmlUrl()
    },
    watch: {
      // If the template html loads mid-run, make sure to initiate localTemplateHtmlUrl
      templateHtml(val, oldVal) {
        if (!!this.loadedHtmlString && val === oldVal) {
          return;
        }
  
        this.localTemplateHtmlUrl()
      },
    },
    beforeDestroy() {
      this.templateResizeObserver.unobserve(this.$refs['email-review-box']);
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .template-card {
    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 37.5px 0 32px;
    cursor: pointer;
    &:hover {
      box-shadow: 2px 0 20px 0 $shadow;
    }
  
    &.disabled {
      cursor: not-allowed;
    }
  
    .menu-dropdown {
      position: absolute;
      top: 7px;
      right: 1px;
    }
  
    .upper-section {
      width: 100%;
      padding: 0 67px;
      .email-review-box {
        position: relative;
        width: 100%;
        margin: 0 auto;
        padding-top: 69%;
        border-radius: 3px;
        border: 1px solid $blueGrey500;
    
        .email-iframe-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
    
          .email-iframe {
            pointer-events: none;
          }
        }
    
        .email-review-box-loading {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(#D8D8D8, 0.21);
        }
      }
    }
  
    .lower-section {
      margin-top: 23px;
      padding: 0 20px;
    
      .email-template-description {
        margin-top: 7px;
      }
    }
  }
  </style>
  