<template>
    <div class="multi-events-chart">
      <div v-if="isLoading" class="multi-events-chart__loading">
        <am2-loading-spinner size="48px" />
      </div>
  
      <apexcharts
        v-if="chartOptions"
        class="multi-events-chart__chart"
        :width="chartOptions.chart.width"
        :height="chartOptions.chart.height"
        :type="chartOptions.type"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </template>
  
  <script>
  import deepmerge from "deepmerge";
  
  export default {
    name: 'MultiEventsChart',
    props: {
      isLoading: {
        type: Boolean,
        default: false,
      },
      series: {
        type: Array,
        default: () => [],
      },
      options: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        chartOptions: null,
        defaultOptions: {
          type: 'line',
          stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
          },
          fill: {
            colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
            type: 'solid',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.7,
              stops: [0, 100]
            }
          },
          legend: {
            horizontalAlign: 'left',
            itemMargin: {
              horizontal: 10,
            },
            markers: {
              width: 9,
              height: 9,
              fillColors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
            }
          },
          markers: {
            size: 0,
            strokeColors: ['#7344c0'],
            colors: ['#fff'],
          },
          tooltip: {},
          dataLabels: {
            enabled: false
          },
          chart: {
            height: 380,
            width: '100%',
            fontFamily: 'Graphik',
            animations: {
              enabled: false,
            },
            zoom: {
              enabled: false,
              type: 'xy',
              autoScaleYaxis: true
            },
            toolbar: {
              tools: {
                download: false,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
              },
              autoSelected: 'zoom'
            },
          },
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeUTC: false,
              style: {
                colors: '#8e97a6',
                fontSize: '12px',
                fontFamily: 'Graphik',
                fontWeight: 400,
                cssClass: 'apex-axis-text-class'
              },
              datetimeFormatter: {
                year: 'yyyy',
                month: 'MMM \'yy',
                day: 'MMM dd',
                hour: 'HH:mm'
              }
            },
            tooltip: {},
            crosshairs: {
              stroke: {
                color: '#EDEEF1',
              },
            },
          },
          yaxis: {
            labels: {
              minWidth: 50,
              style: {
                colors: ['#8e97a6'],
                fontSize: '12px',
                fontFamily: 'Graphik',
                fontWeight: 400,
                cssClass: 'apex-axis-text-class'
              },
              align: 'right',
            },
            crosshairs: {
              stroke: {
                color: '#EDEEF1',
              },
            },
          },
        },
      };
    },
  
    computed: {
      calculatedSeries() {
        return this.series
      }
    },
  
    watch: {
      options() {
        this.initChartOptions()
      },
    },
  
    methods: {
      initChartOptions() {
        let options = this.mergeOptions(this.defaultOptions, this.options)
        this.chartOptions = options
      },
      mergeOptions(existingOptions, newOptions) {
        let options = deepmerge(existingOptions, newOptions, {
          arrayMerge: (destination, source) => {
            return [ ...destination, ...source ]
          }
        })
  
        return options
      },
    },
  
    mounted() {
      this.initChartOptions()
    },
  }
  </script>
  
  <style lang="scss">
  .multi-events-chart {
    position: relative;
  
    &__loading {
      position: absolute;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 99;
    }
  }
  </style>
  