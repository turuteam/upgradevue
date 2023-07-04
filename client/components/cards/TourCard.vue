<template>
    <div class="index-card">
      <div :class="['index-card--wrapper', showAs, cardSize]">
        <nuxt-link
          :to="{ path: `/tours/${tour.oid}/view/campaigns` }"
          class="card-link"
          :data-test-id="`tour-card-${tourNameInKebabCase}`"
        >
          <article 
            v-if="showAs === 'list'" 
            class="card-list-item"
            :class="[
              $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
              $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
              $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max'
            ]">
            <div class="card-image">
              <div class="tour-list-image-wrapper">
                <template>
                  <div v-if="cardImage" class="blurred-image-bg" :style="`background-image: url(${cardImage})`"/>
                </template>
                <div class="view-tour-button-overlay">
                  <button class="view-tour-button">View</button>
                </div>
                <img v-if="cardImage" class="tour-image" :src="cardImage">
                <div v-else class="tour-tile-image-default" />
              </div>
            </div>
            <div :class="[
                'card-content',
                cardSize,
              ]">
              <header class="card-detail">
                <ar-text
                  size="17px"
                  class="tour-list-heading"
                  :text="tour.name"
                  weight="bold"
                  multiple-lines
                  :max-lines="1"
                  line-height="25px"
                />
                <ar-text
                  size="15px"
                  class="card-list-copy"
                  :text="campaignCopy"
                  multiple-lines
                  :max-lines="1"
                />
              </header>
  
              <div :class="[
                'card-footer',
                cardSize,
              ]">
                <div class="registrations-and-views">
                  <div class="registrations">
                    <ar-icon
                      name="user"
                      height="13px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{totalRegistrations}} Registrations</span>
                  </div>
                  <div class="views">
                    <ar-icon
                      name="preview"
                      width="17px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{ uniqueViews }} Views</span>
                  </div>
                </div>
  
                <!-- <div class="end">
                  <span v-if="!isActive">Ended on {{ formatDate(tour.endDate) }}</span>
                  <span v-else>Ends in <Countdown :date="tour.endDate" class="countdown" /></span>
                </div> -->
              </div>
  
              <!-- <am2-signal-tag
                v-if="isActive"
                text="Active"
                class="signal-tag"
              /> -->
            </div>
          </article>
  
          <!-- Tiles -->
  
          <article v-else class="card-tile">
            <div class="card-image">
              <div class="tour-list-image-wrapper">
                <template>
                  <div v-if="cardImage" class="blurred-image-bg" :style="`background-image: url(${cardImage})`"/>
                </template>
                <div class="view-tour-button-overlay">
                  <button class="view-tour-button">View</button>
                </div>
                <img v-if="cardImage" class="tour-image" :src="cardImage">
                <div v-else class="tour-tile-image-default" />
              </div>
            </div>
  
            <div :class="[
                'card-content',
                cardSize,
              ]">
              <header class="card-detail">
                <div class="heading-and-tag">
                  <ar-text
                    size="md"
                    class="tour-card-heading"
                    :text="tour.name"
                    multiple-lines
                    :max-lines="1"
                    line-height="25px"
                  />
                </div>
                <ar-text
                  size="sm"
                  class="card-list-copy"
                  :text="campaignCopy"
                  multiple-lines
                  :max-lines="1"
                />
              </header>
              <div :class="[
                'card-footer',
                cardSize,
              ]">
                <div class="registrations-and-views">
                  <div class="registrations">
                    <ar-icon
                      name="user"
                      height="13px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{totalRegistrations}} {{ cardSize !== 'xs' ? 'Registrations' : null }}</span>
                  </div>
                  <div class="views">
                    <ar-icon
                      name="preview"
                      width="17px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{ uniqueViews }} {{ cardSize !== 'xs' ? 'Views' : null }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </nuxt-link>
        <am2-tour-dropdown
          class="tour-dropdown"
          :style="{
            top: showAs === 'tiles' ? '13px' : '17px',
            right: showAs === 'tiles' ? '13px' : '17px',
          }"
          :menu-icon-color="showAs === 'tiles' ? 'white' : null"
          kind="menu"
          menu-style="secondary"
          :tour="tour"
          @delete="handleTourDelete" />
  
      </div>
  
    </div>
  </template>
  
  <script>
  
  import accounting from 'accounting';
  
  export default {
    name: 'Tour',
  
    props: {
      onDelete: {
        type: Function,
      },
      showAs: {
        type: String,
        required: true,
        validator: function (value) {
          return ['list', 'tiles'].indexOf(value) !== -1;
        },
      },
      cardSize: {
        type: String,
        default: 'regular',
        validator: function (value) {
          return ['xs', 'regular'].indexOf(value) !== -1;
        },
      },
      tour: {
        type: Object,
        required: true
      }
    },
  
    data: () => ({
      imageLoaded: false,
    }),
  
    methods: {
      updateElementWidth() {
        this.elementWidth = this.$el.offsetWidth;
      },
      handleImageLoaded() {
        this.imageLoaded = true;
      },
      getCampaignImage(oid) {
        return tourImage(this.tours[oid])
      },
      handleTourDelete() {
        this.$emit('delete');
      },
    },
    computed: {
      tourNameInKebabCase() {
        if (!this.tour) {
          return '';
        }
        return this.tour.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\da-z-]/gi, '');
      },
      campaignCopy() {
        if (this.campaignOidsLength === 1) {
          return `${this.campaignOidsLength} campaign`
        } else {
          return `${this.campaignOidsLength} campaigns`
        }
      },
      totalRegistrations() {
        return accounting.formatNumber(this.tour.summaryStats.totalRegistrations);
      },
      uniqueViews() {
        return accounting.formatNumber(this.tour.summaryStats.uniqueViews);
      },
      cardImage() {
        const cardImage = this.tour.resources.find(resource => resource.assetType === 'campaign-image');
        return cardImage ? cardImage.url : '/images/placeholders/image-default.png';
      },
      campaignOidsLength() {
        return this.tour.campaignOids ? this.tour.campaignOids.length : null;
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  
  $cardBorderRadius: 4px;
  @mixin flexRow {
      display: flex;
      flex-flow: row nowrap;
  }
  
  /* TODO */
  .countdown {
    display: inline-block;
  }
  
  .index-card--wrapper {
    border: 1px solid $skyBlueGrey400;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    background-color: #fff;
    height: 100%;
    position: relative;
  
    .tour-dropdown {
      position: absolute;
      z-index: 50;
    }
  
    .card-link {
      text-decoration: none;
      height: 100%;
      display: block;
  
      .card-tile {
        display: flex;
        flex-direction: column;
        height: 100%;
        box-shadow: 0 0 13px -1px rgba(0, 0, 0, 0.1);
  
        &:hover {
          -webkit-box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
                box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
  
          .card-image {
            .tour-list-image-wrapper {
              .view-tour-button-overlay {
                opacity: 1
              }
            }
          }
        }
  
        .card-image {
          height: 187px;
  
          .tour-list-image-wrapper {
            position: relative;
            overflow: hidden;
            min-width: 192px;
            height: 100%;
            flex-shrink: 1;
            border-top-left-radius: $cardBorderRadius;
            border-bottom-left-radius: $cardBorderRadius;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
  
            .blurred-image-bg {
              height: 100%;
              width: 100%;
              position: absolute;
              -webkit-filter: blur(5px);
              -moz-filter: blur(5px);
              -o-filter: blur(5px);
              -ms-filter: blur(5px);
              filter: blur(5px);
            }        
  
            .view-tour-button-overlay {
              opacity: 0;
              position: absolute;
              top: 0;
              z-index: 40;
              background: rgba(31, 40, 68, 0.8);
              width: 100%;
              height: 100%;
              @include flexRow;
              align-items: center;
              justify-content: center;
  
              .view-tour-button {
                font-family: Graphik;
                font-weight: 600;
                font-size: 14px;
                line-height: 14px;
                background: transparent;
                color: white;
                border: 1px solid white;
                border-radius: 3px;
                padding: 13px 24px 11px;
                cursor: pointer;
  
                &:focus {
                  outline: none;
                }
              }
            }
  
            .tour-image {
              position: relative;
              width: 100%;
              height: auto;
              z-index: 20;
            }
          }
        }
  
        .card-content {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
          height: 100%;
          padding: 25px 30px 0 30px;
  
          &.xs {
            padding: 20px 16px 0 16px;
          }
  
          .active-tag {
            position: absolute;
            top: 11px;
            right: 45px;
          }
  
          .card-detail {
            .heading-and-tag {
              display: flex;
              width: 100%;
              justify-content: space-between;
              h1 {
                line-height: 25px;
                margin-bottom: 7px;
                overflow: hidden;
                max-height: 50px;
                word-break: break-word;
              }
              .active-tag {
                margin-right: 0;
              }
            }
  
            .card-list-copy {
              color: $blueGrey700;
              margin-top: 6px;
            }
          }
  
          .card-footer {
            display: flex;
            justify-content: space-between;
  
            margin-top: 36px;
            border-top: 1px solid $blueGrey400;
            padding: 16px 0;
            font-size: 14px;
            line-height: 1;
            color: $blueGrey700;
            flex-direction: column;
  
            .registrations-and-views {
              display: flex;
              flex-flow: row nowrap;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 7px;
  
              .registrations {
                margin-right: 15px;
              }
            }
          }
        }
      }
  
      .card-list-item {
        display: flex;
        height: 100%;
        box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.2);
  
        &.md-max {
          .card-image {
            width: 40%;
          }
        }
  
        &.sm-max {
          .card-image {
            width: 40%;
          }
        }      
  
        &:hover {
            -webkit-box-shadow: 0px 10px 14px -8px rgba(0, 0, 0, 0.4) !important;
              box-shadow: 0px 10px 14px -8px rgba(0, 0, 0, 0.4) !important;
          .card-image {
            .tour-list-image-wrapper {
              .view-tour-button-overlay {
                opacity: 1
              }
            }
          }
        }
  
        .card-image {
          width: 368px;
          min-width: 250px;
  
          .tour-list-image-wrapper {
            position: relative;
            overflow: hidden;
            min-width: 192px;
            height: 100%;
            flex-shrink: 1;
            border-top-left-radius: $cardBorderRadius;
            border-bottom-left-radius: $cardBorderRadius;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
  
            .blurred-image-bg {
              height: 100%;
              width: 100%;
              position: absolute;
              -webkit-filter: blur(5px);
              -moz-filter: blur(5px);
              -o-filter: blur(5px);
              -ms-filter: blur(5px);
              filter: blur(5px);
            }
  
            .view-tour-button-overlay {
              opacity: 0;
              position: absolute;
              top: 0;
              z-index: 40;
              background: rgba(31, 40, 68, 0.8);
              width: 100%;
              height: 100%;
              @include flexRow;
              align-items: center;
              justify-content: center;
  
              .view-tour-button {
                font-family: Graphik;
                font-weight: 600;
                font-size: 14px;
                line-height: 14px;
                background: transparent;
                color: white;
                border: 1px solid white;
                border-radius: 3px;
                padding: 13px 24px 11px;
                cursor: pointer;
  
                &:focus {
                  outline: none;
                }
              }
            }
  
            .tour-image {
              width: 100%;
              height: auto;
              z-index: 20;
              position: relative;
            }
          }
        }
  
        .card-content {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
          margin: 0 30px;
          padding: 23px 0;
  
          .card-detail {
  
            .tour-list-heading {
              width: calc(100% - 30px);
            }
  
            .card-list-copy {
              color: $blueGrey700;
              width: 92%;
              margin-top: 6px;
            }
          }
  
          .card-footer {
            display: flex;
            width: 100%;
            justify-content: space-between;
            font-size: 14px;
            line-height: 20px;
  
            .registrations-and-views {
              display: flex;
              flex-shrink: 1;
              overflow: hidden;
              width: 100%;
  
              .registrations {
                color: $blueGrey700;
                margin-right: 15px;
                min-width: 0;
                white-space: nowrap;
                overflow-x: hidden;
                text-overflow: ellipsis;
              }
              .views {
                color: $blueGrey700;
              }
            }
  
            .end {
              display: flex;
              flex-shrink: 0;
              color: $blueGrey700;
            }
          }
        }
      }
    }
  }
  </style>
  