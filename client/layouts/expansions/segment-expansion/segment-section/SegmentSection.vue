<template>
  <section>
    <am2-ask-input-modal
      :is-show="showCreateNewFilterModal"
      :max-width="'590px'"
      title="Save segment"
      input-title="Segment name"
      input-placeholder="Enter name here..."
      @confirm="createFilter"
      @close="showCreateNewFilterModal = false"
      data-test-id="filter-save-segment-button"
    />
    <div class="filter-section-content">
      <div class="filter-section-title-section">
        <am2-step-link
          v-if="$arMediaQuery.window.maxWidth('sm')"
          class="filter-section-function-back-text"
          text="Back"
          @click="handleExtendedSideBar"
        />
        <am2-heading
          type="h1"
          size="sm"
          weight="bold"
          title="Filter"
        />
        <ar-icon
          name="cross-thick"
          height="16px"
          class="close-filter-icon"
          @click.native="handleCrossClick"
        />
      </div>
      <ar-divider class="u-margin-top-6 u-margin-bottom-7" />
      <div
        class="filter-section-filters-panel"
      >
        <div class="filter-section-dropdown-button-wrapper">
          <am2-simple-button-dropdown
            class="dropdown-button"
            :button-props="{
              iconName: 'circle-plus',
              iconProps: { height: '16px' },
              text: 'Add filter',
              outlined: true,
              style: { height: '40px', width: '100%' }
            }"
            :items="segmentCriteriaItems"
            :dropdown-max-height="$arMediaQuery.window.maxWidth('xs') ? '50vh' : 'calc(100vh - 207px)'"
            :dropdown-style="{
              width: $arMediaQuery.window.maxWidth('xs') ? 'calc(100vw - 30px)' : '330px',
            }"
            has-search
            search-placeholder="Search filter"
            @select="handleCriteriaSelect"
            @searchStringChange="handleSearchStringChange"
            data-test-id="filter-sidebar-add-filter-button"
          />
        </div>
        <div
          ref="filters-wrapper"
          :class="[
            'filter-section-filters-wrapper',
            $arMediaQuery.window.maxWidth('sm') && 'sm-max',
          ]"
        >
          <am2-loading-section
            v-if="isFetchingFilter"
            class="filter-section-loading"
          />
          <div
            v-else-if="!!scratchSegment && !!scratchSegment.filter && !!scratchSegment.filter.conditions && scratchSegment.filter.conditions.length > 0"
            class="filters-content"
            ref="filters-content"
          >
            <div
              ref="condition-renderer"
              v-for="(condition, conditionIndex) in scratchSegment.filter.conditions"
              :key="scratchSegmentConditionHashMap[conditionIndex]"
            >
              <div
                @click="handleConditionClick(conditionIndex)"
              >
                <am2-filter-condition-renderer
                  :filter-criteria="segmentCriteriaMap[condition.name]"
                  :filter-condition="condition"
                  :disable-review="disableReview"
                  :hide-button="hideFilterApplyButton"
                  @apply="($event) => applyCondition(conditionIndex, $event)"
                  @delete="deleteCondition(conditionIndex)"
                  @resourcesUpdate="handleResourcesUpdate"
                />
              </div>
              <div
                v-if="scratchSegment.filter.logic[conditionIndex]"
                class="filter-section-logic-section"
                @click="updateLogic(conditionIndex)"
              >
                <div class="filter-section-logic-divider"/>
                <div class="filter-section-logic-box">
                  {{ scratchSegment.filter.logic[conditionIndex] }}
                </div>
              </div>
            </div>
          </div>
          <ar-text
            v-else
            class="filter-section-no-filter-paragraph"
            size="xs"
            :text="emptyFilterText"
            allow-html
            multiple-lines
            align="center"
          />
        </div>
      </div>
      <div
        :class="[
          'filter-section-functions-section',
          (scratchSegmentInfo && scratchSegmentInfo.source === 'message-segment') && 'message-segment'
        ]"
      >
        <template v-if="hideCreateSegmentButton">
          <am2-lock-simple-button
            v-if="!isAudienceFeatureEnabled"
            v-tooltip.top="{
              content: !isAudienceFeatureEnabled ? 'Save segments so you can target specific segments within your audience.<br><br>Upgrade your plan to get access.' : null,
              classes: ['align-left'],
            }"
            text="Save segment"
            type="purple"
            outlined
            :style="{ width: 'calc(50% - 30px)', height: '50px' }"
            @click="handleDisabledSaveClick"
            data-test-id="filter-disabled-save-button"
          />
        </template>
        <!-- If it's empty filter, show `Delete` button -->
        <ar-simple-button
          v-else-if="showFilterDeleteButton"
          :loading="isDeletingSegment"
          text="Delete segment"
          outlined
          :style="{ width: 'calc(50% - 30px)', height: '50px' }"
          @click="handleSavedFilterDelete"
          data-test-id="filter-delete-button"
        />
        <ar-simple-button
          v-else-if="showFilterSaveButton && !(scratchSegmentInfo && scratchSegmentInfo.source === 'message-segment')"
          :loading="isPatchingSegment || isCreatingSegment"
          text="Save segment"
          outlined
          :style="{ width: 'calc(50% - 30px)', height: '50px' }"
          @click="handleSaveClick"
          data-test-id="filter-save-button"
        />
        <ar-simple-button
          v-if="!isAudienceFeatureEnabled || showFilterClearButton"
          class="clear-button"
          text="Clear"
          outlined
          @click="handleClearFilterClick"
          :style="{ 
            height: '50px',
            width: hideCreateSegmentButton ? '90%' : 'calc(50% - 30px)',
            marginLeft: hideCreateSegmentButton ? 'unset' : '20px'
          }"
          data-test-id="filter-clear-button"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { clone } from '@/utils/helpers/';

export default {
  name: 'FilterSidebar',
  data() {
    return {
      showCreateNewFilterModal: false,
      isFetchingFilters: false,
      isFetchingFilter: false,
      criteriaItemSearchString: '',
    };
  },

  computed: {
    ...mapState({
      route: state => state.route,
      segmentCriteriaGroups: state => state.segment.segmentCriteriaGroups,
      segmentCriteriaMap: state => state.segment.segmentCriteriaMap,
      scratchSegment: state => state.segment.scratchSegment,
      scratchSegmentConditionHashMap: state => state.segment.scratchSegmentConditionHashMap,
      scratchSegmentInfo: state => state.segment.scratchSegmentInfo,
      isPatchingSegment: state => state.segment.isPatchingSegment,
      isCreatingSegment: state => state.segment.isCreatingSegment,
      isDeletingSegment: state => state.segment.isDeletingSegment,
      scratchEmailMessage: state => state.message.scratchEmailMessage,
      scratchSimpleMessage: state => state.message.scratchSimpleMessage,
      currentSelectedMessage: state => state.message.currentSelectedMessage,
      hideCreateSegmentButton: state => state.layout.hideCreateSegmentButton,
      hideFilterApplyButton: state => state.layout.hideFilterApplyButton,
    }),
    ...mapGetters({
      isFeatureEnabled: 'auth/isFeatureEnabled',
      prunedScratchSegment: 'segment/prunedScratchSegment',
      activeSavedSegment: 'segment/activeSavedSegment',
    }),
    disableReview() {
      return this.route.path === '/insights';
    },

    isAudienceFeatureEnabled() {
      return this.isFeatureEnabled(['audience']);
    },

    segmentCriteriaItems() {
      const items = [];
      for (let i = 0; i < this.segmentCriteriaGroups.length; i += 1) {
        const criteriaGroup = this.segmentCriteriaGroups[i];
        const criteria = criteriaGroup.data;
        items.push({
          type: 'header',
          name: criteriaGroup.title,
        });
        for (let j = 0; j < criteria.length; j += 1) {
          items.push({
            name: criteria[j].title,
            criteriaResourceName: criteria[j].resource,
          });
        }
      }
      return items.filter(item => {
        return item.name.toLowerCase().indexOf(this.criteriaItemSearchString.toLowerCase()) > -1;
      });
    },

    showFilterSaveButton() {
      return this.scratchSegmentInfo.changed;
    },

    showFilterClearButton() {
      return this.scratchSegmentInfo.source === 'saved-audience-filter' || this.scratchSegmentInfo.changed;
    },

    showFilterDeleteButton() {
      return this.scratchSegmentInfo.source === 'saved-audience-filter' &&  !this.scratchSegmentInfo.changed;
    },

    emptyFilterText() {
      if (this.scratchSegmentInfo.source === 'internal-audience-filter') {
        return 'Add a Filter to begin, or select from one of your existing segments.';
      } else if (this.scratchSegmentInfo.source === 'saved-audience-filter') {
        return `The segment <b>${this.scratchSegment.name}</b> contains no filters`;
      }
    },
  },

  watch: {
    route: {
      handler(newRoute, oldRoute) {
        const oldRouteMainPage = oldRoute.path.split('/')[1];

        // Reset scratch segment only if new route is NOT in audience or insights
        // OR the old route is from message-center
        const isAudienceOrInsights = newRoute.path === '/audience' || newRoute.path === '/insights'
        if (isAudienceOrInsights && oldRouteMainPage === 'message-center') {
          this['segment/RESET_SCRATCH_SEGMENT']();
        }

        this['layout/TOGGLE_SEGMENT_DRAWER']({toggle: false});
      },
    },
    prunedScratchSegment() {
      if (this.scratchSegmentInfo.changed) {
        this['segment/UPDATE_SCRATCH_SEGMENT']();
      }
    },
  },

  created() {
    window.addEventListener('scroll', this.handleScroll);
  },

  async mounted() {
    // TODO: One day we will remove this awaits
    // We need it for the moment because the order is important
    await this['segment/FETCH_SEGMENT_CRITERIA']();
    this.initializeFilter();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    ...mapActions([
      'segment/FETCH_SEGMENT_CRITERIA',
      'segment/FETCH_SEGMENTS',
      'segment/CREATE_SEGMENT',
      'segment/UPDATE_SAVED_SEGMENT',
      'segment/UPDATE_SCRATCH_SEGMENT',
      'segment/DELETE_SEGMENT',
      'OPEN_CANCELLATION_MODAL',
      'SHOW_MULTIPLE_BUTTON_MODAL',
    ]),

    ...mapMutations([
      'layout/TOGGLE_SEGMENT_DRAWER',
      'segment/SET_SCRATCH_SEGMENT_BY_SAVED_SEGMENT',
      'segment/RESET_SCRATCH_SEGMENT',
      'segment/RESET_SCRATCH_SEGMENT_FROM_MESSAGE_SEGMENT',
      'segment/ADD_SCRATCH_SEGMENT_CONDITION',
      'segment/TOGGLE_SCRATCH_SEGMENT_LOGIC',
      'segment/SET_SCRATCH_SEGMENT_CONDITION',
      'segment/DELETE_SCRATCH_SEGMENT_CONDITION',
      'segment/ADD_TO_CONDITION_SEARCH_PICKER_CHOSEN_ITEM_MAP',
      'message/PUT_FILTERING_IN_SCRATCH_EMAIL_MESSAGE',
      'message/PUT_FILTERING_IN_SCRATCH_SIMPLE_MESSAGE',
    ]),

    handleResourcesUpdate(resource, items) {
      this['segment/ADD_TO_CONDITION_SEARCH_PICKER_CHOSEN_ITEM_MAP']({
        resource,
        items,
      });
    },

    applyCondition(conditionIndex, filterCondition) {
      this['segment/SET_SCRATCH_SEGMENT_CONDITION']({ conditionIndex, filterCondition })
    },

    deleteCondition(conditionIndex) {
      this['segment/DELETE_SCRATCH_SEGMENT_CONDITION'](conditionIndex)
      if (this.scratchSegmentInfo.source === "message-segment") {
        if (!!this.scratchEmailMessage && !!this.scratchEmailMessage.meta.messageListOid) { // Email
          this['message/PUT_FILTERING_IN_SCRATCH_EMAIL_MESSAGE'](this.prunedScratchSegment.filter);
        } else if (!!this.scratchSimpleMessage && !!this.scratchSimpleMessage.meta.messageListOid) { // SMS
          this['message/PUT_FILTERING_IN_SCRATCH_SIMPLE_MESSAGE'](this.prunedScratchSegment.filter);
        }
      }
    },

    async initializeFilter() {    // Initialize audience filter
      const routeParts = this.$route.path.split('/');
      // If route is in message-center and creating a new email or sms
      // FETCH and RESET of these segments should happen inside the email and sms creation instead
      // Otherwise, the timing of the Fetch and Reset will conflict to when the filters are loading inside messaging
      if (routeParts[1] === 'message-center' && routeParts.length >= 3 && (routeParts[3] === 'email' || routeParts[3] === 'sms')) {
        return
      }

      let queryFilterOid;
      if (this.route.query) {
        queryFilterOid = parseInt(this.route.query.filterOid, 10);
      };

      if (queryFilterOid) {
        this['segment/SET_SCRATCH_SEGMENT_BY_SAVED_SEGMENT'](queryFilterOid);
      } else {
        await this['segment/FETCH_SEGMENTS']({});
        this['segment/RESET_SCRATCH_SEGMENT']();
      }
    },

    scrollFiltersWrapper(margin) {
      const elem = this.$refs['filters-wrapper'];
      elem.scrollTop += margin || elem.scrollHeight;
    },

    handleExtendedSideBar() {
      this['layout/TOGGLE_SEGMENT_DRAWER']({toggle: false});
    },

    handleSavedFilterDelete() {
      this.deleteFilter(this.activeSavedSegment);
    },

    handleDisabledSaveClick() {
      this.$router.push({
        path: `/plans`
      })
    },

    handleCrossClick() {
      this['layout/TOGGLE_SEGMENT_DRAWER']({toggle: false});
    },

    async handleSaveClick() {
      if (this.scratchSegmentInfo.source === 'saved-audience-filter') {
        // Saved filter is there, you're going to update it with logic of scratchSegment
        await this.SHOW_MULTIPLE_BUTTON_MODAL({
          title: 'Would you like to create a new segment or update the existing segment?',
          buttons: [
            {
              props: {
                text: 'Update Segment',
                outlined: true,
                style: {
                  width: '196px',
                },
              },
              clickHandler: () => {
                this.updateSavedFilter();
              },
            },
            {
              props: {
                text: 'Create New Segment',
                style: {
                  width: '196px',
                },
              },
              clickHandler: () => {
                this.showCreateNewFilterModal = true;
              },
            }
          ]
        });

      } else {
        // No saved filter found, you're going to create one with logic of scratchSegment
        this.showCreateNewFilterModal = true;
      }
    },

    handleConditionClick(conditionIndex) {
      setTimeout(() => {
        const filtersWrapperElem = this.$refs['filters-wrapper'];
        const filtersContentElem = this.$refs['filters-content'];
        const conditionElem = this.$refs['condition-renderer'];
        // if (conditionElem[conditionIndex].offsetTop - filtersWrapperElem.scrollTop + 300 > filtersWrapperElem.offsetHeight) {
        //   this.scrollFiltersWrapper(250);
        // }
      }, 30);
    },

    handleCriteriaSelect(item) {
      this['segment/ADD_SCRATCH_SEGMENT_CONDITION']({ segmentCriteriaResource: item.criteriaResourceName });
    },

    createFilter(name) {
      this['segment/CREATE_SEGMENT']({
        filter: clone(this.prunedScratchSegment.filter),
        name,
      });
      this.showCreateNewFilterModal = false;
    },

    updateSavedFilter() {
      this['segment/UPDATE_SAVED_SEGMENT']({
        oid: this.activeSavedSegment.oid,
        editFilter: {
          filter: this.prunedScratchSegment.filter,
        },
      });
    },

    async deleteFilter(filter) {
      this['segment/DELETE_SEGMENT'](filter);
    },

    handleClearFilterClick() {
      const routeParts = this.$route.path.split('/');
      const mainPage = routeParts[1];

      // If it's inside the message, we want to reset the scratch message as a message segment
      if (mainPage == "message-center") {
        this['segment/RESET_SCRATCH_SEGMENT_FROM_MESSAGE_SEGMENT']();
      } else {
        this['segment/RESET_SCRATCH_SEGMENT']();
      }
    },

    // Currently just change all of them together
    updateLogic(index) {
      this['segment/TOGGLE_SCRATCH_SEGMENT_LOGIC'](index);
    },

    handleSearchStringChange(searchString) {
      this.criteriaItemSearchString = searchString;
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-section-content {
  position: relative;
  width: 100%;
  height: 100vh;
  padding: 14px 0 20px;

  .filter-section-title-section {
    display: flex;
    position: relative;
    margin: 0 20px;
    justify-content: center;
    .filter-section-function-back-text {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }

  .close-filter-icon {
    position: absolute;
    right:0;
    top:0;
    cursor: pointer;
    color: $blueGrey700;
    transition: color 0.2s;

    &:hover {
      color: $purple500;
    }
  }

  .filter-section-filters-panel {
    .filter-section-dropdown-button-wrapper {
      margin: 0 20px;
      .dropdown-button {
        width: 100%;
        height: 40px;
      }
      .filter-section-add-condtion-button {
        color: $purple500;
        position: relative;
        top: -1px;
        display: flex;
        align-items: center;
        justify-content: center;
        span {
          margin-left: 5px;
          margin-top: 3px;
        }
      }
    }

    .filter-section-filters-wrapper {
      margin-top: 9px;
      height: calc(100vh - 222px);
      -webkit-overflow-scrolling: touch;
      overflow: auto;
      padding: 0 20px 16px;

      &.sm-max {
        padding-bottom: 120px;
      }

      .filter-section-loading {
        height: 30%;;
      }

      .filters-content {
        position: relative;

        .filter-section-logic-section {
          position: relative;
          height: 40px;
          cursor: pointer;
          &:hover {
            .filter-section-logic-box {
              color: $purple500;
              border: 1px solid $purple500;
            }
          }

          .filter-section-logic-divider {
            position: absolute;
            top: 50%;
            width: 100%;
            transform: translateY(-50%);
            transition: all 0.3s;
            border-top: 1px solid $skyBlueGrey500;
          }

          .filter-section-logic-box {
            position: absolute;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            left: 50%;
            top: 50%;
            width: 40px;
            height: 20px;
            transform: translateX(-50%) translateY(-50%);
            border: 1px solid $skyBlueGrey500;
            border-radius: 3px;
            background: white;
            z-index: $zIndexRegular;
            color: $blueGrey600;
            font-size: 12px;
            transition: all 0.3s;
            user-select: none;
          }
        }
      }
      .filter-section-no-filter-paragraph {
        color: $purple500;
        margin: 7px 8px 0;
      }
    }
  }
  .filter-section-functions-section {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 90px;
    border-top: 1px solid $blueGrey400;
    background: white;
    z-index: $zIndexHigh;
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
