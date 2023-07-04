<template>
    <am2-card-container
      layout="soft"
      @click="handleCardClick"
      :style="{
        cursor: link || path ? 'pointer' : null,
      }"
      class="activity-card">
      <div class="activity-card__main">
        <ar-avatar
          v-if="imagePath"
          :image-path="imagePath"
          :name="title"
        />
        <ar-icon
          v-else-if="icon.name"
          :class="[
            'activity-card-icon',
            types.join(' '),
          ]"
          type="secondary"
          :name="icon.name"
          :color="icon.iconColor ? icon.iconColor : '#000'"
          :width="icon.width"
          :height="icon.height"
          :wrapper-style="{
            backgroundColor: icon.iconBackground ? icon.iconBackground : null,
            height: '40px',
            minWidth: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
          }"
        />
        <div class="card-details">
          <div class="card-details__top">
            <ar-text
              v-if="combinedText"
              size="xs"
              class="text text-title"
              allow-html
              multiple-lines
              :text="combinedText"
              weight="normal"
            />
  
            <ar-text
              v-if="children.length > 0"
              size="xxxs"
              weight="normal"
              class="text show-activity-text"
              :text="cardIsExpanded ? `<a>Hide Activity</a>` : `<a>Show Activity</a>`"
              @anchorClick="toggleCardExpand"
              allow-html
            />
          </div>
  
          <div class="text-timeago-wrapper">
            <ar-text
              v-if="datetime"
              class="text-timeago"
              size="xxxs"
              :text="calculateTimeElapsed(datetime)"
              v-tooltip.bottom="{
                content: calculateLongTimeString(datetime),
              }"
              weight="normal"
            />
          </div>
        </div>
      </div>
      <div
        v-if="text"
        class="activity-card__details">
        <ar-text
          size="xs"
          class="text-body"
          :text="text"
          multiple-lines
          weight="normal"
        />
      </div>
      <div :class="[
        'activity-card__sub',
        cardIsExpanded && 'is-expanded'
      ]">
        <am2-activity-card
          v-for="child in children"
          :key="child.oid"
          :image-path="child.imagePath"
          :title="child.title"
          :subtitle="child.subtitle"
          :datetime="child.datetime"
          :text="child.text"
          :icon="child.icon"
          :children="[]"
        />
        <div :style="{
          backgroundColor: $arStyle.color.skyBlueGrey400,
          width: '2px',
          height: 'calc(100% - 48px)',
          position: 'absolute',
          top: '24px',
          left: '39px',
        }"></div>
      </div>
  
    </am2-card-container>
  </template>
  
  <script>
    import dayjs from 'dayjs'
    import advancedFormat from 'dayjs/plugin/advancedFormat';
    dayjs.extend(advancedFormat)
    import { timeago } from '@/utils/date/';
  
    export default {
      name: 'ActivityCard',
  
      props: {
        imagePath: {
          type: String,
          default: '',
        },
        icon: {
          type: Object,
          default: () => {
            return {
              name: null,
              iconColor: '#FFF',
              iconBackground: null,
              width: '24px',
              height: '24px',
            }
          },
        },
        title: {
          type: String,
          default: '',
        },
        subtitle: {
          type: String,
          default: '',
        },
        datetime: {
          type: String,
          default: '',
        },
        text: {
          type: String,
          default: '',
        },
        path: {
          type: String,
          default: null,
        },
        link: {
          type: String,
          default: null,
        },
        types: {
          type: Array,
          default:  () => []
        },
        children: {
          type: Array,
          default:  () => []
        }
      },
  
      data() {
        return {
          cardIsExpanded: false,
        }
      },
  
      computed: {
        combinedText() {
          if (!this.title && !this.subtitle) return '';
          if (!this.subtitle) return this.title;
          if (!this.title) return `<span class='subtitle' style="margin-left: 8px; color: ${this.$arStyle.color.blueGrey600}">${this.subtitle}</span>`;
          return `${this.title} <span class='subtitle' style="margin-left: 8px; color: ${this.$arStyle.color.blueGrey600}">— ${this.subtitle}</span>`;
        },
      },
  
      methods: {
        calculateTimeElapsed(date) {
          return timeago(date);
        },
        calculateLongTimeString(date) {
          return dayjs(date).format('h:m a, MMMM Do, YYYY');
        },
        toggleCardExpand() {
          this.cardIsExpanded = !this.cardIsExpanded;
        },
        handleCardClick() {
          if (this.path) {
            this.$router.push(this.path);
            return;
          }
          if (this.link) {
            window.open(this.link, '__blank');
            return;
          }
        },
      }
    };
  </script>
  
  <style lang="scss" scoped>
    .activity-card {
      width: 100%;
  
      &__main {
        width: 100%;
        padding: 20px;
        display:flex;
        align-items: center;
      }
  
      &-icon {
        min-width: 40px;
  
        &.fan-message,
        &.eventbrite,
        &.shopify {
          border: 1px solid $skyBlueGrey400;
        }
      }
  
      .card-details {
        padding-left:12px;
  
        &__top {
          display:flex;
          flex-direction: row;
          align-items:center;
  
          .subtitle {
            margin-left:8px;
            color: $blueGrey600;
          }
  
          .show-activity-text {
            position: absolute;
            right: 22px;
            top: 26px;
          }
        }
  
        .text-timeago-wrapper {
          margin-top: 4px;
          display: flex;
          .text-timeago {
            color: $blueGrey600;
          }
        }
  
        .text-body {
          margin-top: 24px;
        }
      }
  
      &__details {
        padding: 0 20px 20px 70px;
      }
  
      &__sub {
        transition: opacity 0.375s, max-height 0.375s;
        max-height:0;
        opacity: 0;
        position:relative;
        overflow:hidden;
        &.is-expanded {
          max-height: 1000px;
          opacity: 1;
          overflow-y:scroll;
        }
        >>> .activity-card {
          margin-bottom:0;
          border-radius: 0;
          &__main {
            padding-left:16px;
            padding-top:16px;
          }
          &:first-child {
            border-left: none;
            border-right: none;
            border-bottom: none;
          }
          &:not(:first-child) {
            border: none;
          }
  
          >>> .ar-icon-avatar {
            z-index: 1;
            border: 4px solid #FFF;
            box-sizing: content-box;
          }
        }
      }
  
    }
  </style>
  