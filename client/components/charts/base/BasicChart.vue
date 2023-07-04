<template>
    <div class="ar-basic-chart" :id="elementId" />
  </template>
  
  <script>
  import { generateHash } from '@/utils/helpers'
  import merge from 'deepmerge';
  import common from './common';
  
  export default {
    props: {
      tooltipTitle: {
        type: String,
        default: ""
      },
      tooltipLabelFormat: {
        type: Function,
        default: (point) => {}
      },
      tooltipValueFormat: {
        type: Function,
        default: (point) => {}
      },
      options: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        elementId: generateHash(),
        chart: null,
      };
    },
    watch: {
      options() {
        this.drawChart();
      },
    },
    methods: {
      formatTooltip(tooltipTitle, tooltipLabelFormat, tooltipValueFormat) {
        return {
          formatter() {
            const generateRow = point => `
              <div class="tooltip-body-row">
                <div class="tooltip-body-title">
                  <div class="tooltip-body-dot" style="background: ${point.color}"></div>
                  <p>${tooltipLabelFormat(point)}</p>
                </div>
                <p class="tooltip-body-value">
                  ${tooltipValueFormat(point)}
                </p>
              </div>`;
  
            return `
              <div class="ar-tooltip-container">
                <div class="tooltip-header">
                  ${tooltipTitle}
                </div>
                <div class="tooltip-body">
                  ${this.points ? this.points.map(generateRow).join('') : generateRow(this.point)}
                </div>
              </div>
            `;
          },
          useHTML: true,
          shared: true,
          shadow: false,
          padding: 0,
          hideDelay: 0,
          backgroundColor: 'white',
          borderColor: this.$arStyle.color.blueGrey500,
          borderRadius: 5,
          borderWidth: 1,
          split: false,
          style: {
            fontFamily: 'Graphik',
            fontSize: '14px',
          },
          enabled: true,
        };
      },
      generateHighChartsOptions() {
        return merge.all([
          common.options,
          {
            exporting: { enabled: false },
            yAxis: {
              reserveSpace: true,
              title: {
                enabled: false
              },
              gridLineColor: "#EDEEF1",
            },
            xAxis: {
              tickLength: 0,
              gridLineColor: "#EDEEF1",
              lineColor: "#DCDEE4",
            },
            tooltip: this.formatTooltip(this.tooltipTitle, this.tooltipLabelFormat, this.tooltipValueFormat),
            chart: {
              scrollablePlotArea: {
                minWidth: 400,
                minHeight: 100,
                opacity: 0,
              }
            },
          },
          this.options
        ],
        { arrayMerge: (destinationArray, sourceArray, options) => sourceArray });
      },
      waitForHighChartsSdkInit() {
        return new Promise((resolve) => {
          const handleHightchartsSdkLoad = () => {
            resolve();
            window.removeEventListener('highchartsSdkLoaded', handleHightchartsSdkLoad);
          };
          window.addEventListener('highchartsSdkLoaded', handleHightchartsSdkLoad);
        });
      },
      importHighChartsJs() {
        return new Promise((resolve) => {
          const js = document.createElement("script");
  
          js.type = 'text/javascript';
          js.src = 'https://code.highcharts.com/highcharts.js';
  
          js.onload = () => {
            resolve();
          };
          document.body.appendChild(js);
        });
      },
      drawChart() {
        if (!window.Highcharts) { return; }
        window.Highcharts.setOptions({ lang: { thousandsSep: ',' } });
        const chart = window.Highcharts.chart(
          this.elementId,
          this.generateHighChartsOptions(),
        );
        this.chart = chart;
        chart.reflow();
        this.$emit('chartReady');
      },
      destroyChart() {
        if (!this.chart) { return; }
        this.chart.destroy();
      },
    },
    async mounted() {
      if (window.Highcharts) {
        // Sdk has been loaded
      } else if (window.waitingForHighchartsSdkInit) {
        // Other component has kicked off sdk loading, let's wait
        await this.waitForHighChartsSdkInit();
      } else {
        // Looks like we haven't started sdk loading, let's kick it off
        window.waitingForHighchartsSdkInit = true;
        await this.importHighChartsJs();
        window.dispatchEvent(new CustomEvent('highchartsSdkLoaded'));
      }
      this.drawChart();
    },
    beforeDestroy() {
      this.destroyChart();
    },
  }
  </script>
  
  <style lang="scss" scoped>
  
  $tooltip-inner-spacing: 15px;
  .ar-basic-chart {
    >>> .highcharts-scrollable-mask {
      display:none; // Hiding because it breaks
    }
  
    >>> .highcharts-tooltip {
  
      .highcharts-tooltip-box {
        opacity: 0; // Hiding because it causes ugly white corners on tooltips
      }
  
      > span {
  
        .ar-tooltip-container {
          .tooltip-header {
            font-family: 'Graphik';
            padding: $tooltip-inner-spacing;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: $skyBlueGrey500 1px solid;
          }
  
          .tooltip-body {
            padding: $tooltip-inner-spacing;
  
            // this is needed for 'nice' inner spacing
            // of point(s) info (see 02B of Events.sketch)
            min-width: 275px;
  
            .tooltip-body-row {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              color: $blueGrey700;
  
              p {
                line-height: 1rem;
              }
  
              .tooltip-body-title {
                display: inherit;
                flex-direction: inherit;
                align-items: center;
                justify-content: flex-start;
                font-family: 'Graphik';
                color: $blueGrey800;
  
                .tooltip-body-dot {
                  width: 10px;
                  height: 10px;
                  border-radius: 100%;
                  margin-right: 10px;
                }
              }
  
              .tooltip-body-value {
                padding-left: 10px;
              }
            }
          }
        }
      }
    }
  }
  
  
  </style>
  
  