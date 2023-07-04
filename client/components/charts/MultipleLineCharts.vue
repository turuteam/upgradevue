<template>
    <MulitpleChartsFrame
      :title="title"
      :description="description"
      :topics="topics"
      :hideTitle="hideTitle"
      :hideSwitchButtons="hideSwitchButtons"
      :topicIndex="topicIndex"
      :loading="loading"
      @topicChange="handleTopicChange"
    >
      <BasicChart
        v-if="displayedData"
        :tooltip-title="title"
        :options="options"
      />
    </MulitpleChartsFrame>
  </template>
  
  <script>
  import { clone } from '@/utils/helpers/';
  
  export default {
    name: 'MultipleLineCharts',
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
    },
    computed: {
  
      currentTopic() {
        return this.topics ? this.topics[this.topicIndex] : null;
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
  
      options() {
        if (!this.displayedData || !this.currentTopic) {
          return {};
        }
  
        const chartTitle = this.title;
        const chartDatas = this.chartDatas;
        const currentTopic = this.currentTopic;
        const formatTooltipPointY = this.formatTooltipPointY;
        const formatTooltipLabel = this.formatTooltipLabel;
        const displayedData = this.displayedData;
  
        const themeColorPalette = this.$arStyle.color;
  
        return {
          chart: {
            type: 'line',
            height: '400px',
          },
          time: {
            useUTC: false,
          },
          rangeSelector: {
            enabled: false,
          },
          navigator: {
            enabled: currentTopic.hasNavigator,
            maskFill: 'rgba(247, 243, 255, 0.5)',
            series: {
              type: 'areaspline',
              fillOpacity: 1,
              lineColor: '#7344c0',
              color: '#f3ecff',
            },
            xAxis: {
              labels: {
                formatter() {
                  if (!currentTopic.xAxisLabelFormatter) {
                    return currentTopic.format.replace('{value}', this.value);
                  }
                  return currentTopic.xAxisLabelFormatter(this.value);
                },
              },
            }
          },
          scrollbar: {
            enabled: currentTopic.hasNavigator,
            barBackgroundColor: '#f3ecff',
            barBorderWidth: 1,
            buttonBackgroundColor: 'white',
            buttonArrowColor: 'white',
            buttonBorderWidth: 0,
            trackBackgroundColor: '#F6F9FC',
            margin: 0,
            rifleColor: '#43516b',
          },
          plotOptions: {
            series: {
              marker: {
                fillColor: '#7344c0',
                radius: 4,
              }
            },
          },
          tooltip: {
            formatter() {
              /**
               * All displayedData have same xAxis, so we just use first array to find index of CharData.
               * This is tricky part, cuz when the datas get huge, the `this.x`, which is time, won't match anyone of the time
               * of the displayedDatas you put in, e.x: [[1545808260000, 1], [1545808270000, 2], [1545808280000, 3], ...]
               * Then you might get this.x with `1545808265000`, which is between `1545808260000` and `1545808270000` but
               * not anyone of them, so we find the closest one.
               */
              const firstArrayOfDisplayData = displayedData[0].data;
              const chartDataIndex = firstArrayOfDisplayData.findIndex((item, index) => {
                if (!firstArrayOfDisplayData[index + 1]) {
                  return true;
                }
                const currentTimeX = item[0];
                const nextTimeX = firstArrayOfDisplayData[index + 1][0];
                if (currentTimeX === this.x) { // We got index
                  return true;
                } else if (currentTimeX < this.x && nextTimeX > this.x) {
                  return true;
                }
  
                return false;
              });
              const chartData = chartDatas[chartDataIndex];
              return `
                <div style="box-shadow: 0 2px 6px 0 #E4E5E7; background-color: white; border: 1px solid #E4E5E7;">
                  <div style="padding: 15px; text-align: center; border-bottom: ${themeColorPalette.blueGrey500} 1px solid;">
                    <span style="display: block;">${chartTitle}</span>
                    <span style="font-size: 24px;">${this.points.length > 1 ? this.points.reduce((s, point) => { return s + point.y }, 0) : ''}</span>
                  </div>
                  <div style="padding: 15px; min-width: 275px;">
                    ${this.points.map((point, idx) => `
                      <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 16px;">
                        <div style="display: inline-flex; flex-direction: row; align-items: center; width: 50%;">
                          <div style="width: 10px; height: 10px; border-radius: 100%; margin-right: 10px; background-color: #7344c0;"></div>
                          <p style="line-height: 1;">${formatTooltipLabel(displayedData[idx].name, chartData, idx)}</p>
                        </div>
                        <p style="display: inline-flex; color: #b4b9c4;">
                          ${formatTooltipPointY(point.y, chartData, idx)}
                        </p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            },
            outside: true,
          },
          legend: {
            enabled: currentTopic.hasLegend,
          },
          yAxis: {
            floor: 0,
            showLastLabel: true,
            allowDecimals: false,
            minRange: currentTopic.yAxisMinRange || 20,
            alignTicks: false,
            tickAmount: 8,
            opposite: false,
            labels: {
              enabled: currentTopic.hasYLabel,
              format: currentTopic.format,
              formatter() {
                if (!currentTopic.yAxisLabelFormatter) {
                  return currentTopic.format.replace('{value}', this.value);
                }
                return currentTopic.yAxisLabelFormatter(this.value);
              },
              reserveSpace: true,
              align: 'left',
              y: 2,
            }
          },
          xAxis: {
            type: 'datetime',
            labels: {
              formatter() {
                if (!currentTopic.xAxisLabelFormatter) {
                  return currentTopic.format.replace('{value}', this.value);
                }
                return currentTopic.xAxisLabelFormatter(this.value);
              },
              x: 6,
            }
          },
          series: clone(displayedData),
        };
      }
    },
    methods: {
      formatTooltipLabel(name, chartData, idx) {
        if (!this.currentTopic || !this.currentTopic.toolkitLabelFormatter) {
          return name;
        }
        return this.currentTopic.toolkitLabelFormatter(chartData, idx);
      },
      formatTooltipPointY(pointY, chartData, idx) {
        if (!this.currentTopic || !this.currentTopic.toolkitValueFormatter) {
          return pointY;
        }
        return this.currentTopic.toolkitValueFormatter(chartData, idx);
      },
      handleTopicChange(topic, index) {
        this.$emit('topicChange', topic, index);
      }
    },
  }
  </script>
  
  <style lang="scss" scoped>
  .ticket-type-chart {
  }
  </style>
  
  