<template>
    <MulitpleChartsFrame
      :title="title"
      :title-dropdown-options="titleDropdownOptions"
      :selected-title-topic="selectedTitleTopic"
      :description="description"
      :topics="topics"
      :hideTitle="hideTitle"
      :hideSwitchButtons="hideSwitchButtons"
      :topicIndex="topicIndex"
      :loading="loading"
      :locked="locked"
      :has-data="hasData"
      @topicChange="handleTopicChange"
      @titleTopicChange="handleTitleTopicChange"
    >
      <BasicChart
        v-if="displayedData"
        :tooltip-title="title"
        :options="options" />
    </MulitpleChartsFrame>
  </template>
  
  <script>
  import { clone } from '@/utils/helpers/';
  import { mapState } from 'vuex';
  
  export default {
    name: 'MultipleColumnCharts',
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
      chartDatas: {
        type: Array,
        default: null,
      },
      chartHeight: {
        type: Number,
        default: 400,
      },
      title: {
        type: String,
        default: ""
      },
      titleDropdownOptions: {
        type: Array,
        default: () => [],
      },
      selectedTitleTopic: {
        type: String,
        default: null,
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
    },
    computed: {
      ...mapState({
        useSampling: state => state.auth.useSampling,
      }),
  
      currentTopic() {
        return this.topics ? this.topics[this.topicIndex] : null;
      },
  
      hasData() {
        if (!this.chartDatas || this.chartDatas.length < 1 || this.displayedData.length < 1) {
          return false;
        }
        return this.displayedData.some(item => !!item.data && item.data.length > 0 && item.data.some( subItem => subItem.length >= 2 && subItem[1] > 0));
      },
  
      displayedData() {
        if (!this.currentTopic || !this.chartDatas) {
          return null;
        }
  
        // Magic Number - Should cover most of the more extreme datasets.
        // Let's not show the chart in those cases, to prevent memory errors in browser
        return this.currentTopic.valueGetters.map(({ name, getter }) => ({
          name,
          data: this.chartDatas.length > 50000 ? {} : this.chartDatas.map(data => getter(data)),
        }));
      },
  
      options() {
        if (!this.displayedData || !this.currentTopic) {
          return {};
        }
  
        const chartDatas = this.chartDatas;
        const currentTopic = this.currentTopic;
        const formatTooltipLabel = this.formatTooltipLabel;
        const displayedData = this.displayedData;
  
        const formatTooltipPercentage = this.formatTooltipPercentage;
        const formatTooltipValue = this.formatTooltipValue;
  
        const themeColorPalette = this.$arStyle.color;
        const shouldShowNumber = !this.useSampling;
  
        // Really, most of the time this will only ever contain one item. But all the same, lets future-proof it,
        // just in case.
        let columnCount = displayedData.reduce( (accumulator, currentItem) => {
          return currentItem.data && currentItem.data.length > accumulator ? currentItem.data.length : accumulator;
        }, 0);
  
        let scrollablePlotAreaMinWidth = columnCount > 7 ? 492 : 400;
        if (currentTopic.scrollableMinWidthEnabled) scrollablePlotAreaMinWidth = currentTopic.scrollableMinWidthFactor ? columnCount * currentTopic.scrollableMinWidthFactor : columnCount * 52;
  
        return {
          chart: {
            type: 'column',
            animation: {
              duration: 250,
            },
            height: `${this.chartHeight - (this.hideTitle ? 0 : 50)}px`,
            marginTop: currentTopic.hasLegend ? 70 : 10,
            scrollablePlotArea: {
              minWidth: scrollablePlotAreaMinWidth,
            }
          },
          tooltip: {
            enabled: currentTopic.hasTooltip,
            shared: currentTopic.sharedTooltip || false,
            shape: 'square',
            borderWidth: 0, // Highcharts tooltip defaults conflict with our custom tooltip styling
            hideDelay: 0,
            formatter() {
              const chartData = chartDatas[this.x]; // this.x is the index of our xAxis
  
              if ((this.points && this.points.length === 1) || this.point){
                const index = 0;
                const point = this.points ? this.points[index] : this.point;
                const title = `${formatTooltipLabel(displayedData[index].name, chartData, index)}`;
                const percentage = `${formatTooltipPercentage(point?.y, chartData, index)}`;
                const value = `${formatTooltipValue(point?.y, chartData, index)}`;
                if (currentTopic.tooltipLayout === 2) {
                  return `
                  <div style="box-shadow: 0 2px 6px 0 #E4E5E7; background-color: white; border: 1px solid #DCDEE4; padding: 17px 18px; border-radius: 5px;">
                      <div style="text-align: left;">
                          <p style="line-height: 1; font-size:30px; font-weight: 500; color: ${themeColorPalette.skyBlueGrey800}">${percentage}</p>
                      </div>
                      <div style="margin-top:15px; text-align: left;">
                          <p style="line-height: 1; font-size:14px; color: ${themeColorPalette.skyBlueGrey800}">${title}</p>
                      </div>
                      ${shouldShowNumber
                      ? `
                      <div style="margin-top:12px; text-align: left;">
                          <p style="line-height: 1; font-size:14px; color: ${themeColorPalette.skyBlueGrey700}">${value}</p>
                      </div>
                      `
                      : ``}
                  </div>
                  `;
                } else {
                  return `
                  <div style="box-shadow: 0 2px 6px 0 #E4E5E7; background-color: white; border: 1px solid #DCDEE4; padding: 17px 18px; border-radius: 5px;">
                      <div style="text-align: left;">
                          <p style="line-height: 1; font-size:14px; color: ${themeColorPalette.skyBlueGrey800}">${title}</p>
                      </div>
                      <div style="margin-top:13px; text-align: left;">
                          <p style="line-height: 1; font-size:30px; font-weight: 500; color: ${themeColorPalette.skyBlueGrey800}">${percentage}</p>
                      </div>
                      ${shouldShowNumber
                      ? `
                      <div style="margin-top:12px; text-align: left;">
                          <p style="line-height: 1; font-size:14px; color: ${themeColorPalette.skyBlueGrey700}">${value}</p>
                      </div>
                       `
                       : ``}
                  </div>
                  `;
                }
  
              } else if (this.points && this.points.length > 1) {
                return `
                    <div style="box-shadow: 0 2px 6px 0 #E4E5E7; background-color: white; border: 1px solid #DCDEE4; border-radius: 5px;">
                      <div style="padding: 15px; text-align: center; border-bottom: ${themeColorPalette.blueGrey500} 1px solid;">
                        <span style="display: block;">${currentTopic.name}</span>
                        <span style="font-size: 24px;">${this.points.length > 1 ? this.points.reduce((s, point) => { return s + point.y }, 0) : ''}</span>
                      </div>
                      <div style="padding: 15px; min-width: 275px;">
                        ${this.points.map((point, idx) => `
                          <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 16px;">
                            <div style="display: inline-flex; flex-direction: row; align-items: center; width: 50%;">
                              <div style="width: 10px; height: 10px; border-radius: 100%; margin-right: 10px; background-color: ${point.color};"></div>
                              <p style="line-height: 1;">${formatTooltipLabel(displayedData[idx].name, chartData, idx)}</p>
                            </div>
                            ${shouldShowNumber
                            ? `
                            <p style="display: inline-flex;">
                              ${formatTooltipValue(point.y, chartData, idx)}
                            </p>
                            `
                            : ``}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `;
              }
            },
            useHTML: true,
            outside: false,
          },
          colors: currentTopic.colors || ['#7344C0', '#C96DD8'],
          plotOptions: {
            column: {
              dataLabels: {
                enabled: currentTopic.hasDataLabels,
                format: currentTopic.format ? currentTopic.format.replace('{value}', '{y}') : '{y}',
                crop: false,
                overflow: 'allow',
                color: '#43516b',
              },
              stacking: 'normal',
              pointWidth: currentTopic.columnWidth,
              maxPointWidth: 50,
              pointPadding: 0.01,
              cropThreshold: 93,
              turboThreshold: 0, // Limits number of data points - default is 1000. 0 disables limit.
              stickyTracking: currentTopic.stickyTracking || false,
            },
          },
          legend: {
            enabled: currentTopic.hasLegend,
            align: 'right',
            verticalAlign: 'top',
            floating: false,
          },
          yAxis: {
            minRange: currentTopic.yAxisMinRange || 20,
            min: 0,
            opposite: false,
            maxPadding: 0,
            max: currentTopic.yAxisMax || null,
            labels: {
              enabled: currentTopic.hasYLabel,
              formatter() {
                if (!currentTopic.yAxisLabelFormatter) {
                  return currentTopic.format.replace('{value}', this.value);
                }
                return currentTopic.yAxisLabelFormatter(this.value);
              },
              reserveSpace: true,
              align: 'left',
            }
          },
          xAxis: {
            tickLength: 0,
            type: 'category',
            labels: {
              rotation: currentTopic.xAxisRotation,
              formatter() {
                const chartData = chartDatas[this.pos]; // this.pos is the index of our xAxis
                if (!currentTopic.xAxisLabelFormatter) {
                  return `<span style="display: inline-block; text-align: center; color: #8E97A6; font-size: 12px;">${this.value}</span>`;
                }
                return currentTopic.xAxisLabelFormatter(this.value, chartData);
              },
              useHTML: true,
              // zIndex: 1,
            },
          },
          series: clone(displayedData),
        };
      }
    },
    methods: {
      formatTooltipLabel(name, chartData, idx) {
        if (!this.currentTopic || !this.currentTopic.tooltipLabelFormatter) {
          return name;
        }
        return this.currentTopic.tooltipLabelFormatter(chartData, idx);
      },
      formatTooltipPercentage(value, chartData, idx, total) {
        if (this.currentTopic.tooltipPercentageFormatter) {
          return this.currentTopic.tooltipPercentageFormatter(chartData, idx);
        }
        return '';
      },
      formatTooltipValue(value, chartData, idx) {
        if (!this.currentTopic) {
          return value;
        }
        if (this.currentTopic.tooltipValueFormatter) {
          return this.currentTopic.tooltipValueFormatter(chartData, idx);
        }
        if (this.currentTopic.format) {
          return this.currentTopic.format.replace('{value}', value);
        }
        return value;
      },
      handleTopicChange(topic, index) {
        this.$emit('topicChange', topic, index);
      },
      handleTitleTopicChange(val) {
        this.$emit('titleTopicChange', val);
      },
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .ticket-type-chart {
    height: 100%;
  }
  </style>
  
  