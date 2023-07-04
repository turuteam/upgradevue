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
      :custom-tab-width="customTabWidth"
    >
      <BasicChart
        ref="basicChart"
        v-if="displayedData"
        :tooltip-title="title"
        :options="options" />
    </MulitpleChartsFrame>
  </template>
  
  <script>
  import { clone } from '@/utils/helpers/';
  import { mapState } from 'vuex';
  
  export default {
    name: 'MultipleBarCharts',
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
      chartHeight: {
        type: Number,
        default: null,
      },
      locked: {
        type: Boolean,
        default: false,
      },
      customTabWidth: {
        type: String,
        default: null,
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
        return !(!this.chartDatas || this.chartDatas.length < 1);
      },
  
      displayedData() {
        if (!this.currentTopic || !this.chartDatas) {
          return null;
        }
        return this.currentTopic.valueGetters.map(({ name, getter }) => ({
          name,
          data: this.chartDatas.map(data => getter(data)),
        }));
      },
  
      barWidth() {
        if (!this.currentTopic) {
          return null;
        }
        return this.currentTopic.barWidth;
      },
  
      graphHeight() {
        if (this.chartHeight) {
          return `${this.chartHeight}px`;
        }
        if (!this.displayedData || !this.barWidth) {
          return undefined;
        }
        const yLabelHeight = this.currentTopic.hasYLabel ? 50 : 0;
        const chartPadding = 25;
        let height = 0;
        for (let i = 0; i < this.displayedData.length; i += 1) {
          height += this.displayedData[i].data.length * (this.barWidth + 25);
        }
        
        return `${yLabelHeight + height + chartPadding}px`;
      },
  
      options() {
        if (!this.displayedData || !this.currentTopic) {
          return {};
        }
  
        const chartDatas = this.chartDatas;
        const currentTopic = this.currentTopic;
        const formatTooltipLabel = this.formatTooltipLabel;
  
        const formatTooltipPercentage = this.formatTooltipPercentage;
        const formatTooltipValue = this.formatTooltipValue;
        const displayedData = this.displayedData;
  
        const shouldShowNumber = !this.useSampling;
  
        const themeColorPalette = this.$arStyle.color;
  
        return {
          chart: {
            type: 'bar',
            height: this.graphHeight,
            spacingRight: 40,
            animation: {
              duration: 250,
            },
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
                      <div style="margin-top:13px; text-align: left;">
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
                      <div style="margin-top:15px; text-align: left;">
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
            outside: true,
          },
          colors: currentTopic.colors || [this.$arStyle.color.purple500],
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: currentTopic.hasDataLabels,
                format: currentTopic.format ? currentTopic.format.replace('{value}', '{y}') : '{y}',
                crop: false,
                overflow: 'allow',
                color: '#43516b',
                style: { fontSize: '14px' },
              },
              events: {
                click: event => currentTopic.clickEvent ? currentTopic.clickEvent(event) : null
              },
              pointWidth: currentTopic.barWidth,
              pointPadding: 0.01,
              colorByPoint: !!currentTopic.colors,
              stickyTracking: currentTopic.stickyTracking || false,
              states: {
                hover: {
                  color: currentTopic.hasTooltip ? '#8c5dd9' : this.$arStyle.color.purple500,
                }
              }
            },
          },
          legend: {
            enabled: currentTopic.hasLegend,
          },
          yAxis: {
            opposite: typeof currentTopic.yAxisOpposite !== 'undefined' ? currentTopic.yAxisOpposite : true,
            maxPadding: 0.03,
            minRange: currentTopic.yAxisMinRange || 20,
            min: 0,
            max: currentTopic.yAxisMax || null,
            labels: {
              enabled: currentTopic.hasYLabel,
              formatter() {
                if (!currentTopic.yAxisLabelFormatter) {
                  return currentTopic.format.replace('{value}', this.value);
                }
                return currentTopic.yAxisLabelFormatter(this.value);
              },
              style: {
                textOverflow: 'none'
              }
            }
          },
          xAxis: {
            tickLength: 0,
            type: 'category',
            labels: {
              formatter() {
                const chartData = chartDatas[this.pos]; // this.pos is the index of our xAxis
                if (!currentTopic.xAxisLabelFormatter) {
                  return `<span style="display: inline-block; text-align: right; text-overflow: ellipsis; overflow: hidden; whitespace: no-wrap; min-width: 120px; max-width: 150px; color: #43516b; font-size: 14px;">${this.value}</span>`;
                }
                return currentTopic.xAxisLabelFormatter(this.value, chartData);
              },
              useHTML: true,
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
      formatTooltipPercentage(value, chartData, idx) {
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
      }
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .ticket-type-chart {
    height: 100%;
  }
  </style>
  
  