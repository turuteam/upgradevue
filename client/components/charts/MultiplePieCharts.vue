<template>
    <MulitpleChartsFrame
      :title="title"
      :description="description"
      :topics="topics"
      :hideTitle="hideTitle"
      :hideSwitchButtons="hideSwitchButtons"
      :topicIndex="topicIndex"
      :loading="loading"
      :locked="locked"
      :has-data="hasData"
      @topicChange="handleTopicChange"
    >
      <BasicChart
        ref="basicChart"
        v-if="displayedData"
        :tooltip-title="title"
        :options="options"
        @chartReady="addLegendListeners"
      />
      <div
        ref="centerPiece"
        :class="[
          'center-piece',
          !!highlighted ? 'is-visible' : null,
        ]"
      >
        <ar-text
          :text="highlightedPercentage"
          size="lg"
          align="center"
          :style="{
            color: '#697489', // Colour only exists in this specific use case, so we wont use $arStyle
            marginBottom: '1px',
          }"
        />
        <ar-text
          :text="highlightedTopic"
          size="sm"
          align="center"
          class="u-margin-top-1"
          :style="{
            color: '#8790A1', // Colour only exists in this specific use case, so we wont use $arStyle
          }"
        />
        <ar-text
          :text="highlightedCount"
          v-if="shouldShowNumber"
          size="xs"
          align="center"
          :style="{
            color: $arStyle.color.blueGrey700,
            marginTop: '19px',
          }"
        />
      </div>
    </MulitpleChartsFrame>
  </template>
  
  <script>
  import { clone } from '@/utils/helpers/';
  import { mapState } from 'vuex';
  
  export default {
    name: 'MultiplePieCharts',
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
      chartData: {
        type: Object,
        default: () => null,
      },
      chartHeight: {
        type: Number,
        default: 400,
      },
      title: {
        type: String,
        default: ""
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
      units: {
        type: Object,
        default: () => {
          return {
            singular: null,
            plural: null,
          }
        }
      }
    },
  
    data() {
      return {
        highlighted: null,
      }
    },
    computed: {
      ...mapState({
        useSampling: state => state.auth.useSampling,
      }),
      highlightedPercentage() {
        const total = this.highlighted?.total;
        if (total === 0) return "-";
        const value = this.highlighted?.y;
        const percentage = Math.round((value / total) * 100);
  
        if (percentage === 0 && value !== 0) {
          return "<1%";
        } else if (percentage === 100 && value !== total) {
          return ">99%";
        } else {
          return `${percentage}%`;
        }
      },
  
      highlightedTopic() {
        return this.highlighted?.name;
      },
      highlightedCount() {
        const value = parseInt(this.highlighted?.y || 0);
  
        const unit = this.units?.singular || null;
        const units = this.units?.plural || null;
  
        let cleanValue = value;
        if(value === 1) {
          return unit ? `1 ${unit}` : `1`;
        } if (value > 999 && value <= 99999) {
          cleanValue = `${Math.round(value/1000)}k`;
        } else if (value > 99999 && value <= 999999) {
          cleanValue = `${Math.round(value/1000)}k`;
        } else if (value > 999999) {
          cleanValue = `${(value/1000000).toFixed(1)}m`;
        }
        return units ? `${cleanValue} ${units}` : cleanValue;
      },
  
      currentTopic() {
        return this.topics ? this.topics[this.topicIndex] : null;
      },
  
      displayedData() {
        if (!this.currentTopic || !this.chartData) {
          return null;
        }
        return this.currentTopic.valueGetters.map(({ name, getter }) => ({
          name,
          y: getter(this.chartData),
        }));
      },
  
      shouldShowNumber() {
        return !this.useSampling;
      },
  
      hasData() {
        if (!this.currentTopic || !this.chartData) {
          return false;
        }
        return this.displayedData.some( item => !!item.y && item.y > 0);
      },
  
      options() {
        if (!this.displayedData || !this.currentTopic) {
          return {};
        }
  
        const chartData = this.chartData;
        const currentTopic = this.currentTopic;
        const formatTooltipLabel = this.formatTooltipLabel;
        const formatTooltipPointY = this.formatTooltipPointY;
        const displayedData = this.displayedData;
        const legendClickHandler = this.legendClickHandler;
  
        const themeColorPalette = this.$arStyle.color;
  
        return {
          chart: {
            type: 'pie',
            animation: {
              duration: 250,
            },
            height: `${this.chartHeight - (this.hideTitle ? 0 : 60)}px`,
            scrollablePlotArea: {
              minWidth: 268,
            }
          },
          tooltip: {
            enabled: false,
          },
          colors: currentTopic.colors || ['#7344C0', '#C96DD8', '#3726b7'],
          legend: {
            itemStyle: {
              fontWeight: 'normal',
            },
            y: 10,
          },
          plotOptions: {
            pie: {
              borderWidth: 0,
              innerSize: '73%',
              depth: 10,
              allowPointSelect: false,
              dataLabels: {
                enabled: false,
              },
              showInLegend: true,
              point: {
                events: {
                  mouseOver: this.setHighlighted,
                  mouseOut: this.clearHighlighted,
                },
              },
              states: {
                hover: {
                  enabled: true,
                  brightness: 0,
                  lineWidth: 0,
                  halo: {
                    attributes: {
                      strokeWidth: 0,
                    },
                    opacity: 1,
                  }
                }
              }
            },
            stickyTracking: true,
          },
          series: [{
            name: currentTopic.title,
              data: clone(displayedData),
          }],
        };
      }
    },
  
    beforeDestroy() {
      this.removeLegendListeners();
    },
  
    methods: {
      formatTooltipLabel(name, chartData) {
        if (!this.currentTopic || !this.currentTopic.toolkitLabelFormatter) {
          return name;
        }
        return this.currentTopic.toolkitLabelFormatter(chartData);
      },
  
      formatTooltipPointY(pointX, pointY, chartData) {
        if (!this.currentTopic || !this.currentTopic.toolkitValueFormatter) {
          return pointY;
        }
  
        return this.currentTopic.toolkitValueFormatter(chartData, pointX);
      },
  
      handleTopicChange(topic, index) {
        this.$emit('topicChange', topic, index);
      },
  
      setHighlighted(event) {
        if (this.unHighlightTimeout) clearTimeout(this.unHighlightTimeout);
        this.unHighlightTimeout = null;
        this.highlighted = event.target;
  
        const chart = this.$refs?.basicChart?.chart;
        if (!chart) return;
        const points = chart?.series[0]?.points;
        if (!points) return;
        const highlightedKey = this.highlighted?.name;
        if (!highlightedKey) return;
  
        points.forEach( point => {
          const pointKey = point.name;
          const legendItem = point?.legendItem;
          if (highlightedKey !== pointKey) {
            point.update({opacity: 0.5});
            legendItem.parentGroup.element.style.opacity = 0.5;
          } else {
            point.update({opacity: 1});
            legendItem.parentGroup.element.style.opacity = 1;
          }
        })
      },
  
      legendMouseover(event) {
        event.stopPropagation();
        if (this.unHighlightTimeout) clearTimeout(this.unHighlightTimeout);
        this.unHighlightTimeout = null;
  
        const chart = this.$refs?.basicChart?.chart;
        if (!chart) return;
        const points = chart?.series[0]?.points;
        if (!points) return;
        const currentKey = event.currentTarget.textContent;
        if (!currentKey) return;
        points.forEach( (point, idx) => {
          const pointName = point.name;
          if (pointName === currentKey && chart.series[0].data[idx].visible) {
            chart.series[0].data[idx].setState('hover');
            this.highlighted = chart.series[0].data[idx];
          }
        });
      },
  
      legendMouseout(event) {
        event.stopPropagation();
        this.clearHighlighted();
      },
  
      legendClickHandler(event) {
        event.stopPropagation();
        this.highlighted = null;
      },
  
      clearHighlighted() {
        this.highlighted = null;
        const chart = this.$refs?.basicChart?.chart;
        if (!chart) return;
        const points = chart?.series[0]?.points;
        if (!points) return;
  
        points.forEach( point => {
          point.update({opacity: 1});
          const legendItem = point?.legendItem?.parentGroup?.element;
          if (!legendItem) return;
          legendItem.style.opacity = 1;
        })
      },
  
      addLegendListeners() {
        const chart = this.$refs?.basicChart?.chart;
        if (!chart) return;
        const points = chart?.series[0]?.points;
        if (!points) return;
        points.forEach( point => {
          const legendItem = point?.legendItem?.parentGroup?.element;
          if (!legendItem) return;
          legendItem.addEventListener("mouseover", this.legendMouseover);
          legendItem.addEventListener("mouseout", this.legendMouseout);
          legendItem.addEventListener("click", this.legendClickHandler);
        })
      },
  
      removeLegendListeners() {
        const chart = this.$refs?.basicChart?.chart;
        if (!chart) return;
        const points = chart?.series[0]?.points;
        if (!points) return;
        points.forEach( point => {
          const legendItem = point?.legendItem?.parentGroup?.element;
          if (!legendItem) return;
          legendItem.removeEventListener("mouseover", this.legendMouseover);
          legendItem.removeEventListener("mouseout", this.legendMouseout);
          legendItem.removeEventListener("click", this.legendClickHandler);
        })
      }
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .ticket-type-chart {
    >>>.highcharts-pie-series {
      >>>.highcharts-point {
        stroke: none;
        opacity: 1!important; // Necessary to override inline style set by highcharts
        &.highcharts-point-inactive {
          opacity: 1!important; // Necessary to override inline style set by highcharts
        }
      }
    }
  
    .center-piece {
      position: absolute;
      top: calc(50% - 68px);
      left: calc(50% - 53px);
      width: 106px;
      height: 92px;
      display:none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      &.is-visible {
        display:flex;
      }
    }
  }
  </style>
  
  