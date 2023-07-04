<template>
    <div class="ticket-type-chart" data-component="ticket-type-chart">
      <article :style="{ height: '100%' }">
        <header
          v-if="!hideTitle"
          :class="['header-section', $arMediaQuery.pageContent.minWidth('sm') && 'sm-min']">
          <div class="header-left-section">
            <am2-heading
              type="h1"
              size="md"
              :title="title"
            />
            <am2-link-button-dropdown
              v-if="titleDropdownOptions && titleDropdownOptions.length > 0"
              class="u-margin-left-1"
              :item-key="selectedTitleTopic"
              :items="titleDropdownOptions"
              :item-style="{
                height: '44px',
                padding: '0 20px',
              }"
              :button-props="{
                hasUnderline: false,
                hasArrow: true,
                textProps: {
                  size: 'md',
                },
                color: 'black',
                height: '40px',
              }"
              :style="{
                maxHeight: '40px',
              }"
              @select="handleTitleTopicChange"
            />
  
            <ar-icon
              v-if="description"
              name="tooltip-question-mark"
              class="u-margin-top-1 u-margin-left-2 tooltip-icon"
              :color="$arStyle.color.blueGrey500"
              height="16px"
              width="16px"
              v-tooltip.top="{
                content: description,
              }"
            />
          </div>
          <div
            v-if="groupButtonsSelectItems && !hideSwitchButtons"
            :style="{
                marginTop: $arMediaQuery.pageContent.maxWidth('xs') ? '16px' : '0',
            }"
          >
            <am2-elegant-tabs
              :items="groupButtonsSelectItems"
              :tab-key="topicIndex"
              @select="handleGroupButtonsSelect"
              :style="{
                minWidth: customTabWidth ? customTabWidth : ($arMediaQuery.pageContent.maxWidth('xs') ? '244px' : '264px'),
              }"
              layout="wide"
            />
          </div>
          <!-- question mark -->
        </header>
        <div
          v-if="!loading && hasData"
          :class="[
            'graph-container',
            locked && 'blurred',
          ]">
          <slot />
        </div>
        <div v-else-if="!loading && !hasData"
             :style="{
                height: groupButtonsSelectItems && !hideSwitchButtons ? 'calc(100% - 80px)' : null,
             }"
             class="empty-state-container">
          <ar-state-message
            has-icon
            disable-text-color
            type="general"
            text="No data is available"
          />
        </div>
        <div v-else class="loading-section" :style="{ height: hideTitle ? '100%' : 'calc(100% - 80px)' }">
          <am2-loading-bubble />
        </div>
      </article>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MulitpleChartsFrame',
    props: {
      hideSwitchButtons: {
        type: Boolean,
        default: false,
      },
      hideTitle: {
        type: Boolean,
        default: false,
      },
      loading: {
        type: Boolean,
        default: false
      },
      topics: {
        type: Array,
        default: null,
      },
      selectedTitleTopic: {
        type: String,
        default: null,
      },
      title: {
        type: String,
        default: ""
      },
      titleDropdownOptions: {
        type: Array,
        default: () => [],
      },
      description: {
        type: String,
        default: null,
      },
      topicIndex: {
        type: Number,
        required: true,
      },
      locked: {
        type: Boolean,
        default: false,
      },
      hasData: {
        type: Boolean,
        default: true,
      },
      customTabWidth: {
        type: String,
        default: null,
      },
    },
    computed: {
      groupButtonsSelectItems() {
        if (!this.topics || this.topics.length === 0) {
          return null;
        }
        return this.topics.map( (item, idx) => ({
          name: item.name,
          key: idx,
        }));
      },
    },
    watch: {
      topics(newTopics) { // Just in case topics was not there initially
        if (!newTopics || !newTopics[this.topicIndex]) return;
        this.handleGroupButtonsSelect(newTopics[this.topicIndex], this.topicIndex);
      },
    },
    methods: {
      handleGroupButtonsSelect(item, index) {
        this.$emit('topicChange', this.topics[index], index);
      },
      handleTitleTopicChange(val) {
        this.$emit('titleTopicChange', val);
      },
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .ticket-type-chart {
    .header-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      flex-direction: column;
      align-items: flex-start;
  
      .header-left-section {
        display: flex;
        align-items: flex-start;
        margin-bottom:12px;
  
        .icon {
          color: $blueGrey700;
        }
      }
  
      &.sm-min {
        flex-direction: row;
        align-items: center;
  
        .header-left-section {
          margin-bottom:0;
        }
      }
    }
  
    .empty-state-container {
      width: 100%;
      height: calc(100% - 50px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .graph-container {
      position: relative;
      //overflow: auto;
  
      &.blurred {
        filter: blur(3px);
      }
    }
  
    .loading-section {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  </style>
  
  