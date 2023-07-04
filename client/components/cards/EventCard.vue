<template>

    <div
      @dragenter.prevent="handleDragOver"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @dragend.prevent="handleDragLeave"
      class="event-card"
      :data-test-id="`event-card-${eventNameInKebabCase}`">
  
      <am2-card-container
        :class="[
          'event-card--wrapper',
          showAs,
          layout,
          $arMediaQuery.pageContent.maxWidth('md') && 'md-max'
        ]"
        :layout="layout === 'customer' ? 'soft' : 'regular'"
        @keyup.esc="closeMenu"
      >
  
        <am2-event-dropdown
          v-if="layout === 'promoter' && showAs !== 'micro-list'"
          :class="['event-dropdown', showAs]"
          :menu-icon-color="showAs === 'tiles' ? 'white' : null"
          @delete="handleEventDelete"
          @merge="handleEventMerge"
          @ticketSalesDelete="handleTicketSalesDelete"
          @posOrdersDelete="handlePosOrdersDelete"
          :event="event"
          :oid="event.oid"
          :name="event.name"
          :allow-merging="integrationIsPossible"
          kind="menu"
          menu-style="secondary" />
  
        <am2-dropzone
          v-if="dragOver"
          class="dropzone"
          :file-type="['text/csv']"
          :file-size="209715200"
          file-type-alias="CSV file"
          :placeholder-text-template="'Drag & drop {{fileTypeAlias}} to import ticket sales data'"
          :placeholder-icon="{
            name: 'upload',
            width: '32px',
            height: '32px',
            color: $arStyle.color.purple500,
          }"
          @upload="handleCSVUploaded"
        />
  
        <template v-else>
          <nuxt-link :to="{ path: eventCardLink }" class="card-link" draggable="false">
  
            <!-- List -->
            <article v-if="showAs === 'list'"
              class="card-list-item"
              :class="[
                $arMediaQuery.pageContent.maxWidth('sm') && 'md-max',
                $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max',
              ]"
            >
              <div class="event-list-image-wrapper" :class="[
                layout,
                $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
              ]">
                <template>
                    <div v-if="eventImage" class="blurred-image-bg" :style="`background-image: url(${eventImage})`"/>
                  </template>
                <div class="view-event-button-overlay">
                  <button class="view-event-button">View event</button>
                </div>
                <img v-if="eventImage" class="event-image" :src="eventImage">
                <div v-else class="event-tile-image-default" />
              </div>
  
              <div :class="[
                'card-content',
                cardSize,
                layout,
                $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
              ]">
                <div class="card-copy-wrapper">
                  <header :class="[ 'card-detail', layout ]">
                    <div
                      class="card-detail__header"
                      :class="[
                        $arMediaQuery.pageContent.maxWidth('sm') && 'md-max',
                        $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max',
                      ]"
                    >
                      <ar-text
                        class="event-list-item-heading"
                        size="17px"
                        :text="event.name"
                        weight="bold"
                        multiple-lines
                        :max-lines="1"
                        line-height="25px"
                      />
                      <div v-if="layout === 'promoter' && !!integrations.length" class="integration-icons-wrapper">
                        <template v-for="(integration, index) in integrations">
                          <div :key="index" class="integration-bubble-wrapper" v-tooltip.top="{ content: integration.tooltip }">
                            <ar-icon
                              :name="integration.type"
                              :height="integrationIconSizeMap[integration.type]"
                              :color="integrationIconColorMap[integration.type]"
                            />
                          </div>
                        </template>
                      </div>
                    </div>
                    <div v-if="layout === 'customer'" class="location-and-date">
                      <ar-text
                        size="xs"
                        :text="eventLocationAndDateString"
                        :style="{
                            color: $arStyle.color.blueGrey700,
                          }"
                      />
                    </div>
                  </header>
                  <div :class="[ 'card-footer', layout ]">
                    <div v-if="layout === 'promoter'" class="location-and-date">
                      <div v-if="event.location" class="location">
                        <ar-icon
                          height="16px"
                          name="location"
                          :color="$arStyle.color.blueGrey700"
                        />
                        <ar-text
                          size="xs"
                          :text="event.location"
                          :style="{
                            color: $arStyle.color.blueGrey700,
                            marginLeft: '7px',
                            overflow: 'hidden',
                          }"
                        />
                      </div>
                      <div class="date">
                        <ar-icon
                          height="16px"
                          name="clock"
                          :color="$arStyle.color.blueGrey700"
                        />
                        <ar-text
                          size="xs"
                          :text="dateRange"
                          :style="{
                            color: $arStyle.color.blueGrey700,
                            marginLeft: '7px',
                          }"
                        />
                      </div>
                    </div>
  
                    <div v-if="displayTicketsStats" :class="['tickets-and-capital', layout]">
                      <div v-if="layout === 'promoter'" class="tickets">
                        <ar-icon width="22px" name="ticket" />
                        <ar-text
                          size="xs"
                          :text="`${formatIntegerLocal(eventTotalTicketSold)} ${eventTotalTicketSold === 1 ? 'ticket' : 'tickets'}`"
                          :style="{
                            marginLeft: '5px',
                            color: $arStyle.color.blueGrey700,
                          }"
                        />
                      </div>
                      <am2-tag
                        v-if="layout === 'customer'"
                        class="customer-list-item-tag"
                        type="purple"
                        :text="`${ formatIntegerLocal(eventTotalTicketSold) } ${eventTotalTicketSold === 1 ? 'ticket' : 'tickets'}`"
                        icon-name="ticket"
                        :icon-props="{
                          width: '20px',
                        }"
                        :style="{
                          padding: `0 15px 0 10px`,
                        }"
                      />
                      <div class="event-sales-copy-wrapper">
                        <div
                          class="u-display-flex u-align-items-flex-end"
                          v-tooltip.bottom="{ content: getTicketSalesTooltipCopy }"
                        >
                        <ar-text
                          size="xs"
                          :text="getDollars"
                        />
                        <ar-text
                          class="event-cents"
                          size="10px"
                          :text="getCents"
                        />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
            </article>
  
            <!-- Micro List -->
            <article v-else-if="showAs === 'micro-list'"
                     :class="[
                       'card-micro-list-item',
                        $arMediaQuery.pageContent.maxWidth('sm') && 'md-max',
                        $arMediaQuery.pageContent.maxWidth('xs') && 'sm-max',
                      ]">
              <div
                class="row-item u-padding-y-5 u-padding-x-2"
                :data-test-id="`micro-event-card-${eventNameInKebabCase}`"
                @click="handleSingleEventClick(event.oid)"
              >
                <div class="image-container">
                  <div class="image-wrapper" :class="[
                          $arMediaQuery.pageContent.maxWidth('md') && 'md-max',
                          $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
                        ]">
                    <img v-if="event.image" class="item-image" :src="event.image">
                    <div v-else class="image-default" />
                  </div>
                </div>
                <div class="data-container">
                  <ar-text
                    size="sm"
                    weight="bold"
                    :text="event.name"
                    class="u-margin-bottom-2"
                  />
                  <ar-text
                    size="sm"
                    weight="normal"
                    :text="event.subtitle"
                    :style="{
                        color: $arStyle.color.skyBlueGrey700,
                      }"
                  />
                </div>
                <div class="stats-container">
                  <ar-text
                    size="sm"
                    weight="bold"
                    :text="event.ticketSales"
                    class="u-margin-bottom-2"
                  />
                  <ar-text
                    size="sm"
                    weight="normal"
                    :text="event.ticketQuantity"
                    :style="{
                        color: $arStyle.color.skyBlueGrey700,
                      }"
                  />
                </div>
              </div>
            </article>
  
            <!-- Tiles -->
            <article v-else class="card-tile" @mouseover="showViewEventButton(true)" @mouseleave="showViewEventButton(false)">
  
              <div :class="[
                'card-image',
                serverActionOccuring && 'is-syncing',
                ...tileImageLoaded && 'image-loaded',
                layout
              ]">
  
                <div class="event-tile-image-wrapper">
                  <template>
                    <div v-if="eventImage" class="blurred-image-bg" :style="`background-image: url(${eventImage})`"/>
                  </template>
                  <div class="view-event-button-overlay" :class="viewEventCSS">
                    <button class="view-event-button">View event</button>
                  </div>
                  <img v-if="eventImage" class="event-image" :src="eventImage">
                  <div v-else class="event-tile-image-default" />
                </div>
  
                <div v-if="serverActionOccuring" class="server-action-overlay">
                  <am2-loading-bubble class="sync-bubbles" />
                  {{`${isCurrentlySyncing ? 'Syncing' : 'Merging'}...`}}
                </div>
              </div>
  
              <div
                :class="[
                  'card-content',
                  cardSize,
                  layout,
                ]">
  
                <div class="card-copy-wrapper">
                  <div v-if="layout === 'promoter' && !!integrations.length" class="integration-icons-wrapper">
                    <template v-for="(integration, index) in integrations">
                      <div :key="index" class="integration-bubble-wrapper" v-tooltip.top="{ content: integration.tooltip }">
                        <ar-icon
                          :name="integration.type"
                          :height="integrationIconSizeMap[integration.type]"
                          :color="integrationIconColorMap[integration.type]"
                        />
                      </div>
                    </template>
                  </div>
  
                  <header :class="['card-detail', layout]">
                    <ar-text
                      size="20px"
                      :text="event.name"
                      multiple-lines
                      :max-lines="1"
                      line-height="25px"
                      :style="{
                        marginBottom: '7px',
                      }"
                    />
                    <p
                      class="event-location-text"
                      :style="{
                        wordBreak: 'break-word',
                      }"
                    >{{ eventLocationAndDateString }}</p>
  
                  </header>
  
                  <div v-if="displayTicketsStats" :class="['card-footer', layout]">
                    <div v-if="layout === 'promoter'" class="tickets">
                      <ar-icon width="22px" name="ticket" />
                      <ar-text
                        size="xs"
                        :text="`${formatIntegerLocal(eventTotalTicketSold)} tickets`"
                        :style="{
                          marginLeft: '5px',
                          color: $arStyle.color.blueGrey700,
                        }"
                      />
                    </div>
                    <am2-tag
                      v-if="layout === 'customer'"
                      type="purple"
                      shape="round"
                      :text="`${ formatIntegerLocal(eventTotalTicketSold) } tickets`"
                      icon-name="ticket"
                      :icon-props="{
                        width: '20px',
                      }"
                    />
                    <div class="event-sales-copy-wrapper" v-tooltip.top="{ content: getTicketSalesTooltipCopy }">
                      <ar-text
                        size="xs"
                        :text="getDollars"
                      />
                      <ar-text
                        class="event-cents"
                        size="10px"
                        :text="getCents"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </nuxt-link>
        </template>
      </am2-card-container>
    </div>
  </template>
  
  <script>
  import { isSyncing, isMerging } from '@/utils/event';
  import { displayDateUSRangeCommaAfterDay } from '@/utils/date/';
  import { mapActions, mapGetters } from 'vuex';
  import { centsRemaining, formatInteger, amountInDollars } from '@/utils/helpers';
  
  export default {
    name: 'Event',
    props: {
      showAs: {
        type: String,
        required: true,
        validator: function (value) {
          return ['list', 'micro-list', 'tiles'].indexOf(value) !== -1;
        },
      },
  
      event: {
        type: Object,
        required: true,
      },
  
      statsTooltip: {
        type: String,
        default: null,
      },
  
      cardSize: {
        type: String,
        default: 'regular',
        validator: function (value) {
          return ['xs', 'regular'].indexOf(value) !== -1;
        },
      },
  
      integrationIsPossible: {
        type: Boolean,
        required: true,
      },
  
      layout: {
        type: String,
        default: 'promoter',
        validator: function (value) {
          return ['promoter', 'customer'].indexOf(value) !== -1;
        },
      },
  
    },
  
    data() {
      return {
        dragOver: false,
        tileImageLoaded: false,
        provider: {
          'audience-republic': {
            tooltip: 'This event is not linked to a ticketing platform',
          },
          eventbrite: {
            tooltip: `This event is linked to Eventbrite`,
          },
          zoom: {
            tooltip: `This event is linked to Zoom`,
          },
          universe: {
            tooltip: `This event is linked to Universe`,
          },
          moshtix: {
            tooltip: `This event is linked to Moshtix`,
          },
          eventGenius: {
            tooltip: `This event is linked to Event Genius`,
          },
          ticketek: {
            tooltip: `This event is linked to Ticketek`,
          },
          dice: {
            tooltip: `This event is linked to DICE`,
          },
        },
        integrationIconColorMap: {
          eventbrite: this.$arStyle.color.eventbrite,
          zoom: this.$arStyle.color.zoom,
          universe: this.$arStyle.color.universe,
          moshtix: this.$arStyle.color.moshtix,
          eventix: this.$arStyle.color.eventix,
          'event-genius': this.$arStyle.color.eventGenius,
          ticketek: this.$arStyle.color.ticketek,
          dice: this.$arStyle.color.dice,
        },
        integrationIconSizeMap: {
          eventbrite: '16px',
          zoom: '23px',
          universe: '16px',
          moshtix: '16px',
          eventix: '16px',
          'event-genius': '16px',
          ticketek: '16px',
          dice: '23px',
        },
        showEventDeleteDialog: false,
        integrationType: null,
        integrations: [],
        menuOpen: false,
        showEventButton: false,
      };
    },
  
    computed: {
      ...mapGetters({
        eventHasIntegration: 'event/eventHasIntegration',
        getEventTotalTicketSales: 'event/getEventTotalTicketSales',
        getEventTotalTicketSold: 'event/getEventTotalTicketSold',
      }),
      eventNameInKebabCase() {
        if (!this.event) {
          return '';
        }
        return this.$arUtils.general.generateDataTestPrettyName(this.event.name);
      },
      rsvpCampaign() {
        return this.event.campaigns.find((campaign) => {
          return campaign.type == "rsvp"
        }) || null;
      },
      eventCardLink() {
        if (!!this.rsvpCampaign) {
          return `/events/${this.event.oid}/view/attendees`;
        } else {
          return `/events/${this.event.oid}/view/sales`;
        }
      },
      getTicketSalesTooltipCopy() {
        let copy
        switch (this.layout) {
          case 'customer':
            copy = this.statsTooltip
            break
          case 'promoter':
            copy = `You've had ${this.getDollars}${this.getCents} in ticket sales for this event.`
            break
          default:
            console.log("Couldn't determine tooltip copy")
        }
  
        return copy
      },
  
      viewEventCSS() {
        let css
        if (this.menuOpen || !this.showEventButton) {
            css = 'view-event-overlay-hidden'
        } else if (this.showEventButton) {
            css = 'view-event-overlay-visible'
        }
  
        return css
      },
  
      eventTotalTicketSales() {
        return this.getEventTotalTicketSales(this.event);
      },
  
      eventTotalTicketSold() {
        return this.getEventTotalTicketSold(this.event);
      },
  
      getDollars() {
        return `$${this.amountInDollarsLocal(this.eventTotalTicketSales)}`
      },
  
      getCents() {
        return this.centsRemainingLocal(this.eventTotalTicketSales)
      },
  
      displayTicketsStats() {
        if (!this.eventTotalTicketSold && this.layout === 'customer') {
          return false;
        } else {
          return true;
        }
      },
  
      eventLocationAndDateString() {
        let returnString = '';
        if (this.event.location) {
          returnString = `${this.event.location}, ${this.dateRange}`;
        } else {
          returnString = this.dateRange;
        }
        return returnString;
      },
  
      isCurrentlySyncing() {
        return isSyncing(this.event);
      },
  
      isCurrentlyMerging() {
        return isMerging(this.event);
      },
  
      serverActionOccuring() {
        return this.isCurrentlySyncing || this.isCurrentlyMerging;
      },
  
      eventImage() {
        const eventImage = this.event.resources.find(resource => resource.assetType === 'event-image');
  
        return eventImage ? eventImage.url : null
      },
  
      dateRange() {
        return displayDateUSRangeCommaAfterDay(this.event.startDate, this.event.endDate, this.event.timeZone)
      },
    },
  
    methods: {
      ...mapActions(['OPEN_IMPORT_EVENT_DATA_MODAL']),
  
      formatIntegerLocal: number => formatInteger(number),
      centsRemainingLocal: number => centsRemaining(number),
      amountInDollarsLocal: number => amountInDollars(number),
  
      showViewEventButton(bool) {
        this.showEventButton = bool
      },
      closeMenu() {
        this.menuOpen = false
      },
  
      handleCSVUploaded({ additionalInfo: { headers, body } }) {
        this.dragOver = false;
        this.OPEN_IMPORT_EVENT_DATA_MODAL({
          eventOid: this.oid,
          prefetch: { headers, body },
        });
      },
  
      handleDragOver() {
        this.dragOver = true;
      },
  
      handleDragLeave() {
        this.dragOver = false;
      },
  
      showEventDelete() {
        this.showEventDeleteDialog = true;
      },
  
      handleEventDelete(deletedEventOid) {
        this.$emit('delete', deletedEventOid);
      },
  
      handleEventMerge() {
        this.$emit('merge');
      },
  
      handleTicketSalesDelete() {
        this.$emit('ticketSalesDelete', this.event.oid);
      },
      handlePosOrdersDelete() {
        this.$emit('posOrdersDelete', this.event.oid);
      },
  
      handleSingleEventClick(eventOid) {
        this.$router.push({
          path: `/events/${eventOid}/view/sales`,
        });
      }
    },
  
    mounted() {
      let integrations = []
      if (this.eventHasIntegration(this.event, 'eventbrite')) {
        integrations.push({
          type: 'eventbrite',
          tooltip: 'This event is connected to Eventbrite. Your ticket sales are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'zoom')) {
        integrations.push({
          type: 'zoom',
          tooltip: 'This event is connected to Zoom.'
        })
      }
      if (this.eventHasIntegration(this.event, 'universe')) {
        integrations.push({
          type: 'universe',
          tooltip: 'This event is connected to Universe. Your attendees are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'moshtix')) {
        integrations.push({
          type: 'moshtix',
          tooltip: 'This event is connected to Moshtix. Your attendees are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'ticketek')) {
        integrations.push({
          type: 'ticketek',
          tooltip: 'This event is connected to Ticketek. Your attendees are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'eventix')) {
        integrations.push({
          type: 'eventix',
          tooltip: 'This event is connected to Eventix. Your attendees are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'event-genius')) {
        integrations.push({
          type: 'event-genius',
          tooltip: 'This event is connected to Event Genius. Your ticket sales are automatically being synced.'
        })
      }
      if (this.eventHasIntegration(this.event, 'dice')) {
        integrations.push({
          type: 'dice',
          tooltip: 'This event is connected to DICE. Your attendees are automatically being synced.'
        })
      }
  
      this.integrations = integrations
    },
  };
  </script>
  
  <style lang="scss" scoped>
  
  @mixin flexRow {
      display: flex;
      flex-flow: row nowrap;
  }
  @mixin flexCol {
      display: flex;
      flex-flow: column nowrap;
  }
  
  $cardBorderRadius: 4px;
  
  .event-card {
    border-radius: $cardBorderRadius;
    min-width: 380px;
    width: 380px;
  }
  
  .event-card--wrapper {
    border: none;
    display: flex;
    flex-direction: column;
    border-radius: $cardBorderRadius;
    background-color: #fff;
    position: relative;
    overflow: visible !important;
  
    &.list {
      height: 100px;
  
      &.md-max {
        height: 112px;
      }
  
      &.customer {
        height: 188px;
      }
    }
  
    &.tiles {
      height: 100%;
    }
  
    .event-dropdown {
      position: absolute;
      overflow: hidden;
      display: flex;
      justify-content: center;
      top: 12px !important;
      right: 6px;
      z-index: 30 !important;
  
      &.list {
        top: 14px;
      }
  
      &.tiles {
        top: 9px;
      }
    }
  
    .server-action-overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: $dark-hover-overlay;
      color: white;
  
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  
      font-size: 14px;
      font-family: Graphik;
  
      .sync-bubbles {
        color: white;
      }
    }
  
    .card-image {
      display: inline-block;
      position: relative;
      border-top-left-radius: $cardBorderRadius;
      height: 205px;
      overflow: hidden;
  
      .event-tile-image-wrapper {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
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
  
        .event-image {
          height: 205px;
          z-index: 10;
        }
      }
  
      .sync-bubbles {
        margin-bottom: 29px;
      }
  
      &:not(.is-syncing){
        &::before {
          transition: opacity 0.015s ease-in;
          position: absolute;
          top: 0;
          left: 0;
          z-index: $zIndexHigh;
          width: 100%;
          height: 100%;
          background: $dark-hover-overlay;
          border-top-left-radius: $cardBorderRadius;
          border-top-right-radius: $cardBorderRadius;
          opacity: 0;
          content: ""
        }
  
        &::after {
          transition: opacity 0.015s ease-in;
          opacity: 0;
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: $zIndexHigh;
          transform: translate(-50%, -50%);
          color: #fff;
          content: "View Event";
          font-family: Graphik;
          font-weight: bold;
          padding: 5px 20px;
          border: 1px solid #fff;
          border-radius: 3px;
          white-space: nowrap;
          line-height: 30px;
        }
      }
    }
  
    .card-link {
      text-decoration: none;
      height: 100%;
      display: block;
  
      .card-tile {
        box-shadow: 0 0 13px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 100%;
        border-radius: $cardBorderRadius;
  
        &:hover {
            -webkit-box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
                box-shadow: 0px 10px 27px -9px rgba(0,0,0,0.2) !important;
        }
  
        .card-image {
          width: 100%;
          display: block;
          height: 205px;
          border-top-right-radius: $cardBorderRadius;
          overflow: hidden;
  
          // This is implicit in Chrome, but Firefox
          // will set this to 1 if it's not declared
          flex-shrink: 0;
  
          &:not(.image-loaded) {
            height: 205px;
          }
  
          .event-tile-image-wrapper {
  
            .view-event-button-overlay {
              position: absolute;
              z-index: 20;
              background: rgba(31, 40, 68, 0.8);
              width: 100%;
              height: 100%;
              @include flexRow;
              align-items: center;
              justify-content: center;
  
              .view-event-button {
                font-family: Graphik;
                font-weight: 600;
                font-size: 14px;
                line-height: 14px;
                background: transparent;
                color: white;
                border: 1px solid white;
                border-radius: 3px;
                padding: 13px 24px;
                cursor: pointer;
  
                &:focus {
                  outline: none;
                }
              }
            }
          }
        }
  
        .card-content {
          @include flexRow;
          align-items: center;
          justify-content: center;
          height: 100%;
          position: relative;
          border-bottom-right-radius: $cardBorderRadius;
          border-bottom-left-radius: $cardBorderRadius;
          border-top: 0;
  
          .card-copy-wrapper {
            width: 85%;
            @include flexCol;
            align-self: flex-start;
            justify-content: space-between;
            height: 100%;
            padding-top: 25px;
            position: relative;
  
            @media(max-width: $md-min) {
              padding-top: 23px;
            }
  
            .integration-icons-wrapper {
              z-index: 30;
              position: absolute;
              top: -15px;
              @include flexRow;
  
              .integration-bubble-wrapper {
                @include flexRow;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border: 1px solid $blueGrey500;
                border-radius: 100px;
                overflow: hidden;
                background-color: white;
                z-index: 10;
                cursor: default;
              }
            }
          }
  
          &.xs {
            padding: 20px 16px 0 16px;
          }
  
          &.has-integration {
            padding: 0 30px 0 30px;
          }
  
          .card-detail {
            p {
              font-size: 16px;
              line-height: 25px;
              color: $blueGrey700;
            }
          }
  
          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 19px;
            border-top: 1px solid $blueGrey400;
            padding: 16px 0;
            font-size: 14px;
            line-height: 1;
            > div:not(:last-child) {
              margin-right: 15px;
            }
            .tickets {
              display: inline-flex;
              align-items: center;
              color: $blueGrey700;
            }
  
            .event-sales-copy-wrapper {
              @include flexRow;
              align-items: flex-end;
              justify-content: flex-start;
              height: 12px;
  
              .event-cents {
                position: relative;
                top: -1px;
              }
            }
          }
        }
      }
  
      .card-list-item {
        @include flexRow;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        width: 100%;
        border-radius: $cardBorderRadius;
  
        &:hover {
                  box-shadow: 0 4px 9px -2px rgba(0, 0, 0, 0.3) !important;
          -webkit-box-shadow: 0 4px 9px -2px rgba(0, 0, 0, 0.3) !important;
  
          .event-list-image-wrapper .view-event-button-overlay {
            opacity: 1;
          }
        }
  
        .event-list-image-wrapper {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          width: 100%;
          height: 100%;
          max-width: 192px;
          border-top-left-radius: $cardBorderRadius;
          border-bottom-left-radius: $cardBorderRadius;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: center;
  
          &.md-max {
            max-width: 213px;
          }
  
          &.customer {
            max-width: unset;
            width: 368px;
  
            @media (max-width: $lg-min) {
              max-width: 250px;
            }
          }
  
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
  
          .view-event-button-overlay {
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
  
            .view-event-button {
              font-family: Graphik;
              font-weight: 600;
              font-size: 14px;
              line-height: 14px;
              background: transparent;
              color: white;
              border: 1px solid white;
              border-radius: 3px;
              padding: 13px 24px;
              cursor: pointer;
  
              &:focus {
                outline: none;
              }
            }
          }
  
          .event-image {
            width: 100%;
            height: auto;
            z-index: 20;
          }
        }
  
        .card-image {
          display: inline-block;
          overflow: hidden;
          height: 100%;
          width: 187px;
          min-width: 187px;
          object-fit: cover;
          border-bottom-left-radius: 4px;
          position: relative;
          overflow: hidden;
  
          &.customer {
            width: 368px;
            min-width: 368px;
          }
  
          .sync-bubbles {
            margin-bottom: 9px;
          }
        }
  
        .card-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          margin: 0;
          padding: 0 20px;
          border-top-right-radius: $cardBorderRadius;
          border-bottom-right-radius: $cardBorderRadius;
          border-left: 0;
          overflow: hidden;
  
          &.customer {
            padding: 0 20px 0 25px;
            width: calc(100% - 368px);
          }
  
          &.md-max {
            width: 70%;
          }
  
          &.sm-max {
            width: 60%;
          }
  
          .card-copy-wrapper {
            @include flexCol;
            align-items: flex-start;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 12px 0 8px;
  
            .card-detail {
              display: flex;
              flex-direction: column;
              width: calc(100% - 19px);
  
              &.customer {
                padding-top: 4px;
                width: 100%;
  
                .integration-icons-wrapper {
                  margin-right: 0;
                }
              }
  
              &__header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
  
                &.md-max {
                  .event-list-item-heading {
                    width: 100%;
                  }
                }
  
                .integration-icons-wrapper {
                  z-index: 30;
                  @include flexRow;
                  margin-top: 3px;
  
                  .integration-bubble-wrapper {
                    @include flexRow;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    border: 1px solid $blueGrey500;
                    border-radius: 100px;
                    overflow: hidden;
                    background-color: white;
                    z-index: 10;
                    margin-right: 6px;
                    cursor: default;
                  }
  
                  .integration-bubble-wrapper:last-child {
                    margin-right: 0px;
                  }
                }
  
                .event-list-item-heading {
                  margin-top: 4px;
                }
              }
  
              .location-and-date {
                margin-top: 8px;
              }
            }
          }
  
          .card-footer {
            display: flex;
            padding: 10px 0 0;
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid $blueGrey400;
            font-size: 14px;
  
            @media(max-width: $lg-min) {
              flex-flow: row nowrap;
              padding: 10px 0 0;
          }
  
  
            &.customer {
              border-top: none;
              padding-bottom: 12px;
            }
  
            .location-and-date {
              display: flex;
              margin-right: 15px;
              flex-shrink: 1;
              overflow: hidden;
  
              @media(max-width: $lg-min) {
                justify-content: space-between;
                flex-flow: column nowrap;
                align-items: flex-start;
              }
  
              @media(max-width: $md-min) {
                flex-direction: column;
              }
  
              .location {
                display: flex;
                align-items: center;
                margin-right: 15px;
                overflow: hidden;
                width: 100%;
  
                @media(max-width: $lg-min) {
                  margin-bottom: 6px;
                }
  
                @media(max-width: $md-min) {
                  margin-bottom: 8px;
                  margin-right: 0;
                }
              }
              .date, .tickets {
                display: flex;
                align-items: center;
                flex-shrink: 0;
                color: $blueGrey700;
              }
            }
  
            .tickets-and-capital {
              @include flexRow;
              align-items: center;
              justify-content: flex-end;
              cursor: default;
              flex: 0 0;
  
              @media(max-width: $lg-min) {
                width: 175px;
                flex-flow: column nowrap;
                align-items: flex-end;
              }
  
              @media(max-width: $md-min) {
                width: 135px;
              }
  
              &.customer {
                flex-flow: row nowrap;
                align-items: center;
                width: 300px;
              }
  
              .event-sales-copy-wrapper {
                @include flexRow;
                align-items: flex-end;
                justify-content: flex-end;
                height: 12px;
                width: 100px;
  
                .event-cents {
                  position: relative;
                  top: -1px;
                }
              }
  
              .tickets {
                width: 118px;
                display: inline-flex;
                align-items: center;
                color: $blueGrey700;
  
                @media(max-width: $lg-min) {
                  justify-content: flex-end;
                }
  
                @media(max-width: $lg-min) {
                  margin-bottom: 6px;
                }
              }
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
  
  .view-event-overlay-visible {
      opacity: 1;
  }
  .view-event-overlay-hidden {
      opacity: 0;
  }
  
  .event-tile-image-default {
    // add below colour to our list of variables
    background: #2B214A;
    width: 100%;
    height: 100%;
  }
  
  .dropzone {
    z-index: $zIndexGlobalHigh;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  </style>
  
  
  
  