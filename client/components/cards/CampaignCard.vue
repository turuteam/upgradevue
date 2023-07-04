<template>
    <div
      class="index-card"
      :data-test-id="`campaign-card-${campaignNameInKebabCase}`"
    >
      <am2-card-container :layout="layout === 'customer' ? 'soft' : 'regular'" :class="['index-card--wrapper', showAs, cardSize, layout]">
        <nuxt-link :to="{ path: `/campaigns/${campaign.oid}/view/dashboard` }" class="card-link">
          <!-- List -->
          <article v-if="showAs === 'list'" class="card-list-item">
            <div :class="[
              'card-image',
              layout,
              $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
              $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
            ]">
              <div class="campaign-list-image-wrapper">
                <template>
                  <div v-if="cardImage" class="blurred-image-bg" :style="`background-image: url(${cardImage})`"/>
                </template>
                <div class="view-campaign-button-overlay">
                  <button class="view-campaign-button">View results</button>
                </div>
                <img v-if="cardImage" class="campaign-image" :src="cardImage">
                <div v-else class="campaign-tile-image-default" />
              </div>
            </div>
  
            <div :class="[
                'card-content',
                cardSize,
                layout,
                $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
                $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max',
              ]">
              <header :class="[
                'card-detail',
                layout,
              ]">
                <ar-text
                  size="17px"
                  class="card-list-heading"
                  :text="title"
                  weight="bold"
                  multiple-lines
                  :max-lines="1"
                  line-height="25px"
                  :style="{
                    marginBottom: '3px',
                  }"
                />
  
                <ar-text
                  v-if="campaign.event"
                  size="15px"
                  class="card-list-location"
                  :text="campaign.event.location"
                  multiple-lines
                  :max-lines="1"
                />
              </header>
  
              <div
                :class="[
                  'card-footer',
                  cardSize,
                  layout,
                  $arMediaQuery.pageContent.maxWidth('lg') && 'lg-max',
                  $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                  $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
                  $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max',
                ]"
              >
                <div
                  v-if="layout === 'promoter'"
                  v-show="allRegistrations && uniqueViews"
                  class="registrations-and-views">
                  <div class="registrations">
                    <ar-icon
                      name="user"
                      height="13px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{ allRegistrations }} Registrations</span>
                  </div>
                  <div class="views">
                    <ar-icon
                      class="views"
                      name="preview"
                      width="17px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{ uniqueViews }} Views</span>
                  </div>
                </div>
                <div
                  v-if="layout === 'customer'"
                  class="customer-info u-display-flex u-align-items-center"
                >
                  <am2-tag
                    :text="`${points} ${points == 1 ? `pt` : `pts`}`"
                    type="green"
                    shape="round"
                    :style="{
                      padding: `0 15px`,
                    }"
                  />
                  <ar-text
                    v-if="hasRewardTiers"
                    size="xs"
                    :text="`${campaign.rewards.tiers[0].title}`"
                    :style="{
                      marginLeft: '10px',
                      color: $arStyle.color.skyBlueGrey700,
                    }"
                  />
                  <div v-if="referrals > 0" class="referrals">
                    <ar-text
                      size="xs"
                      :text="`${referrals} ${referrals == 1 ? `referral` : `referrals`}`"
                      :style="{
                        marginLeft: '20px',
                        color: $arStyle.color.skyBlueGrey700,
                      }"
                    />
                  </div>
                </div>
  
                <div class="end" v-if="layout === 'customer'">
                  <Countdown @campaign-ended="campaignEnded" :date="campaign.endDate" class="countdown" />
                </div>
                <div class="tags-container">
                  <am2-generic-tag
                    v-if="isFreeCampaign"
                    text="Free"
                    type="light-grey"
                    :style="{
                      marginBottom: '3px',
                    }"
                  />
                  <am2-signal-tag
                    v-if="isActive"
                    text="Active"
                    :style="{}"
                  />
                </div>
              </div>
            </div>
          </article>
  
          <!-- Micro List -->
          <article v-else-if="showAs === 'micro-list'" class="card-micro-list-item">
            <div
              class="row-item u-padding-y-5 u-padding-x-2"
              :data-test-id="`micro-campaign-card-${campaignNameInKebabCase}`"
              @click="handleSingleCampaignClick(campaign.oid)"
            >
              <div class="image-container">
                <div class="image-wrapper" :class="[
                          $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                          $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
                        ]">
                  <img v-if="campaign.image" class="item-image" :src="campaign.image">
                  <div v-else class="image-default" />
                </div>
              </div>
              <div class="data-container">
                <ar-text
                  size="sm"
                  weight="bold"
                  :text="campaign.name"
                  class="u-margin-bottom-2"
                />
                <ar-text
                  size="sm"
                  weight="normal"
                  :text="campaign.subtitle"
                  :style="{
                        color: $arStyle.color.skyBlueGrey700,
                      }"
                />
              </div>
              <div class="stats-container">
                <ar-text
                  size="sm"
                  weight="bold"
                  :text="campaign.registrations"
                  class="u-margin-bottom-2"
                />
                <ar-text
                  size="sm"
                  weight="normal"
                  :text="campaign.views"
                  :style="{
                        color: $arStyle.color.skyBlueGrey700,
                      }"
                />
              </div>
            </div>
          </article>
  
  
          <!-- Tiles -->
          <article v-else class="card-tile">
            <div class="campaign-card-image-wrapper">
              <template>
                <div v-if="cardImage" class="blurred-image-bg" :style="`background-image: url(${cardImage})`"/>
              </template>
              <div class="view-campaign-button-overlay">
                <button class="view-campaign-button">View results</button>
              </div>
              <img v-if="cardImage" class="campaign-image" :src="cardImage">
              <div v-else class="campaign-image-default" />
            </div>
  
            <div :class="[
                'card-content',
                cardSize,
              ]">
              <header :class="[
                'card-detail',
                layout,
              ]">
                <div
                  :class="[
                    'heading-and-tag',
                    cardSize,
                    ]">
                  <ar-text
                    size="md"
                    :text="title"
                    :max-lines="1"
                    multiple-lines
                    line-height="25px"
                    :style="{
                      maxHeight: '50px',
                      overflow: 'hidden',
                    }"
                  />
                </div>
                <ar-text
                  v-if="campaign.event"
                  size="sm"
                  class="card-list-location"
                  :text="campaign.event.location"
                  multiple-lines
                  :max-lines="1"
                />
              </header>
  
              <div
                :class="[
                  'card-footer',
                  cardSize,
                ]"
                :style="{
                  borderTop: layout === 'customer' ? 'none' : null,
                  padding: layout === 'customer' ? 0 : null,
                }">
                <div
                  v-if="layout === 'promoter'"
                  v-show="allRegistrations && uniqueViews"
                  class="registrations-and-views">
                  <div class="registrations">
                    <ar-icon
                      name="user"
                      height="13px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    {{allRegistrations}}  {{ cardSize !== 'xs' ? 'Registrations' : null }}
                  </div>
                  <div class="views">
                    <ar-icon
                      name="preview"
                      width="17px"
                      :color="$arStyle.color.blueGrey600"
                    />
                    <span>{{ uniqueViews }}  {{ cardSize !== 'xs' ? 'Views' : null }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </nuxt-link>
  
        <am2-generic-tag
          v-if="isFreeCampaign && showAs === 'tiles'"
          text="Free"
          type="light-grey"
          :style="{
            position: 'absolute',
            zIndex: 50,
            top: showAs === 'tiles' ? '13px' : '17px',
            left: showAs === 'tiles' ? '13px' : '17px',
          }"
        />
  
        <am2-campaign-dropdown
          v-if="layout === 'promoter' && showAs !== 'micro-list'"
          kind="menu"
          class="campaign-dropdown"
          :style="{
            top: showAs === 'tiles' ? '13px' : '17px',
            right: showAs === 'tiles' ? '13px' : '17px',
          }"
          :menu-icon-color="showAs === 'tiles' ? 'white' : null"
          :campaign="campaign"
          @delete="handleCampaignDelete"
        />
      </am2-card-container>
    </div>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  import moment from 'moment';
  import accounting from 'accounting';
  import { capitalizeFirstLetter } from '@/utils/helpers';
  import { campaignBaseUri, campaignImage, isCampaignActive as isCampaignActiveUtils} from '@/utils/campaign';
  
  export default {
    name: 'Campaign',
  
    components: {
      Countdown
    },
  
    props: {
      showAs: {
        type: String,
        required: true,
        validator: function (value) {
          return ['list', 'micro-list', 'tiles'].indexOf(value) !== -1;
        },
      },
      cardSize: {
        type: String,
        default: 'regular',
        validator: function (value) {
          return ['xs', 'regular'].indexOf(value) !== -1;
        },
      },
      layout: {
        type: String,
        default: 'promoter',
        validator: function (value) {
          return ['promoter', 'customer'].indexOf(value) !== -1;
        },
      },
      campaign: {
        type: Object,
        required: true
      },
      points: {
        type: Number,
        default: 0,
      },
      referrals: {
        type: Number,
        default: 0,
      },
    },
  
    data() {
      return {
        tileImageLoaded: false,
        isActive: this.isCampaignActive(),
        summaryStats: null
      }
    },
  
    async mounted() {
      if (isCampaignActiveUtils(this.campaign) && this.showAs !== 'micro-list') {
        this.FETCH_CAMPAIGN_REGISTRATIONS(this.campaign.oid)
          .then(data => {
              this.summaryStats = {
                allRegistrations: data.allRegistrations,
                uniqueViews: data.uniqueViews
              }
            })
      }
    },
  
    methods: {
      ...mapActions([
        'FETCH_CAMPAIGN_REGISTRATIONS'
      ]),
  
      handleCampaignDelete() {
        this.$emit('delete');
      },
  
      handleTileImageLoaded() {
        this.tileImageLoaded = true;
      },
  
      previewURL({ type, urlSlug }) {
        return `${campaignBaseUri(type)}${urlSlug}`;
      },
  
      formatDate(date) {
        return moment(date).format('ddd Do MMM, YYYY');
      },
  
      isCampaignActive() {
        return isCampaignActiveUtils(this.campaign);
      },
  
      campaignEnded() {
        this.isActive = false;
      },
  
      handleSingleCampaignClick(campaignOid) {
        this.$router.push({
          path: `/campaigns/${campaignOid}/view`,
        });
      },
    },
  
    computed: {
      campaignNameInKebabCase() {
        if (!this.campaign) {
          return '';
        }
        return this.$arUtils.general.generateDataTestPrettyName(this.campaign.name);
      },
      title() {
        return `${capitalizeFirstLetter(this.campaign.type)}: ${this.campaign.name}`;
      },
      allRegistrations() {
        if (this.isActive) {
          if (this.summaryStats) {
            return accounting.formatNumber(this.summaryStats.allRegistrations);
          } else {
            return null
          }
        } else {
          return accounting.formatNumber(this.campaign.summaryStatsSnapshot.allRegistrations);
        }
      },
      uniqueViews() {
        if (this.isActive) {
          if (this.summaryStats) {
            return accounting.formatNumber(this.summaryStats.uniqueViews);
          } else {
            return null
          }
        } else {
          return accounting.formatNumber(this.campaign.summaryStatsSnapshot.uniqueViews);
        }
      },
      cardImage() {
        return campaignImage(this.campaign);
      },
      hasRewardTiers() {
        return this.campaign && this.campaign.rewards && this.campaign.rewards.tiers && this.campaign.rewards.tiers.length > 0
      },
      isFreeCampaign() {
        return this.campaign && this.campaign.presentation.flow.length === 1;
      },
    }
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
  
  .campaign-list-image-wrapper {
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
      transform: scale(1.04);
    }
  
    .view-campaign-button-overlay {
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
  
      .view-campaign-button {
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
  
    .campaign-image {
      width: 100%;
      height: auto;
      z-index: 30;
      position: relative;
    }
  }
  
  .index-card--wrapper {
    border: 1px solid $skyBlueGrey400;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    background-color: #fff;
    height: 100%;
    position: relative;
  
    &.micro-list {
      border: none;
    }
  
    &.tiles {
      box-shadow: 0 0 13px -1px rgba(0, 0, 0, 0.1);
  
      &:hover {
        -webkit-box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
                box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
  
        .card-link .card-tile .campaign-card-image-wrapper .view-campaign-button-overlay {
          opacity: 1;
        }
      }
    }
  
    .campaign-dropdown {
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
  
        &:hover {
          .view-campaign-button-overlay {
            opacity: 1;
          }
        }
  
        .campaign-card-image-wrapper {
          height: 205px;
          width: 100%;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: center;
          border-top-right-radius: 4px;
          border-top-left-radius: 4px;
  
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
  
          .view-campaign-button-overlay {
            position: absolute;
            z-index: 50;
            background: rgba(31, 40, 68, 0.8);
            width: 100%;
            height: 100%;
            @include flexRow;
            align-items: center;
            justify-content: center;
            opacity: 0;
  
            .view-campaign-button {
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
  
          .campaign-image {
            width: 100%;
            height: 205px;
            z-index: 20;
          }
        }
  
        .card-image {
          border-radius: 4px 4px 0 0;
  
          img {
            border-radius: inherit;
            width: 100%;
            height: 205px;
            display: block;
          }
        }
  
        .card-content {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
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
  
              .active-tag {
                margin-right: 0;
              }
  
              &.regular {
                display:flex;
                margin-bottom:0px;
              }
  
              &.xs {
                display:block;
                margin-bottom:8px;
              }
            }
  
            .card-list-location {
              color: $blueGrey700;
              margin-top: 6px;
            }
          }
  
          .card-footer {
            display: flex;
            justify-content: space-between;
  
            margin-top: 28px;
            border-top: 1px solid $blueGrey400;
            padding: 12px 0;
            font-size: 14px;
            line-height: 1;
            color: $blueGrey700;
            flex-direction: column;
            position: relative;
  
            .registrations-and-views {
              display: flex;
              flex-flow: row nowrap;
              align-items: center;
              margin-bottom: 6px;
              justify-content: space-between;
  
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
        box-shadow: 0 4px 9px -2px rgba(0, 0, 0, 0.1);
  
        &:hover {
                  box-shadow: 0 4px 9px -2px rgba(0, 0, 0, 0.3) !important;
          -webkit-box-shadow: 0 4px 9px -2px rgba(0, 0, 0, 0.3) !important;
  
          .campaign-list-image-wrapper .view-campaign-button-overlay {
            opacity: 1;
          }
        }
  
        .card-image {
          // We used to have hard-coded height here so the image was always at
          // a 16:9 aspect ratio. Now that we do image excess-blurring, we don't
          // need a hard-coded height anymore.
          width: 368px;
          flex-shrink: 0;
          border-radius: 4px 0 0 4px;
  
          &.md-max {
            width: 30%;
          }
  
          &.sm-max {
            width: 40%;
          }
        }
  
        .card-content {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
          margin: 0 32px;
  
          .card-detail {
            padding: 27px 0 4px;
  
            .card-list-heading {
              width: calc(100% - 30px);
            }
  
            .card-list-location {
              color: $blueGrey700;
              width: 92%;
              margin-top: 6px;
            }
  
            &.customer {
              height:106px;
            }
          }
  
          .card-footer {
            width: 100%;
            display: flex;
            flex-flow: row nowrap;
            align-items: flex-end;
            justify-content: space-between;
            font-size: 14px;
            line-height: 20px;
            margin-bottom: 24px;
  
            .tags-container {
              display: flex;
              flex-direction: column;
            }
  
            &.sm-max {
              .registrations-and-views {
                flex-flow: column nowrap;
                align-items: flex-start;
              }
            }
  
            .registrations-and-views {
              display: flex;
              flex-shrink: 1;
              overflow: hidden;
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
  
            &.customer {
              justify-content: space-between;
            }
  
            .customer-info {
              margin-bottom: -6px;
  
              .referrals {
                border-left: 1px solid $blueGrey500;
                margin-left: 20px;
                height: 30px;
                display: flex;
                align-items: center;
              }
            }
  
            .end {
              display: flex;
              flex-shrink: 0;
              color: $blueGrey700;
              justify-content: flex-start;
            }
          }
        }
      }
  
      .card-micro-list-item {
        .row-item {
          width: 100%;
          display:flex;
          transition: background-color 0.1s;
          cursor: pointer;
          &:hover {
            background-color: $purple100;
          }
  
          .image-container {
            flex: 1;
            max-width: 90px;
  
            .image-wrapper {
              max-width: 71px;
              max-height: 40px;
              height: 100%;
  
              .item-image {
                width: 100%;
              }
  
              .image-default {
                background: #2B214A;
                width: 100%;
                height: 100%;
              }
            }
          }
          .data-container {
            flex: 4;
  
          }
          .stats-container {
            flex: 2;
            align-items: flex-end;
            display: flex;
            flex-direction: column;
          }
        }
      }
    }
  }
  </style>
  
  
  
  
  
  
  
  
  
  
  
  