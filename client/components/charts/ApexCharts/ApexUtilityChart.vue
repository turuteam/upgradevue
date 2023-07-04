<template>
    <div class="apex-charts-wrapper">
      <div v-if="loading" class="sales-chart-loading-wrapper">
        <am2-loading-spinner size="48px" />
      </div>
      <ApexToolbar 
        v-if="chartOptions"
        :chartId="chartId"
        :selectedToolbarElement="selectedToolbarElement"
        :withoutToolbar="withoutToolbar"
        @selection="handleToolbarSelection"
        :is-category-type="isCategoryType"
      />
  
      <apexcharts
        v-if="chartOptions"
        :id="chartId"
        :key="key"
        class="am2-utility-chart"
        :class="[isCategoryType ? 'marginLeft' : '']"
        :ref="chartId"
        :width="chartOptions.chart.width"
        :height="chartOptions.chart.height"
        :type="chartOptions.type"
        :options="chartOptions"
        :series="series"
      />
  
      <AnnotationModule
        :annotations="annotations"
        :next-annotation="nextAnnotation"
        :annotationHandlers="annotationHandlers"
        :chart-config="chartConfig"
        :styles="styles"
        :with-annotations="withAnnotations"
        :timezone="timezone"
        :clear-active="clearActiveAnnos"
        @cancel-create="handleCancelAnnoCreate"
      >
        <slot name="annotation" :annotation="unpackAnnotation(annotation)" />
      </AnnotationModule>
    </div>
  </template>
  <script>
  import deepmerge from 'deepmerge'
  import { generateRandomString } from '@/utils/helpers'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone'
  import localizedFormat from 'dayjs/plugin/localizedFormat'
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(localizedFormat)
  
  const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay))
  
  export default {
    name: 'ApexUtilityChart',
    props: {
      options: {
        type: Object,
        default: null
      },
      series: {
        type: Array,
        default: null
      },
      zoom: {
        type: Object,
        default: null
      },
      chartId: {
        type: String,
        default: ''
      },
      withAnnotations: {
        type: Boolean,
        default: false
      },
      annotationHandlers: {
        type: Object,
        default: null
      },
      annotations: {
        type: Array,
        default: () => []
      },
      styles: {
        type: Object,
        default: () => {}
      },
      withoutToolbar: {
        type: Boolean,
        default: false,
      },
      tooltipPlacement: {
        type: String,
        default: 'vertical',
      },
      timezone: {
        type: String,
        default: null,
      },
      renderKey: {
        type: String,
        default: null,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      animation: {
        type: Object,
        default: null,
      },
      selectedToolbarIcon: {
        type: String,
        default: 'select'
      },
      hasDragListener: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        mouseDownAdded: false,
        mouseUpAdded: false,
        key: null,
        selectedToolbarElement: 'select',
        chartConfig: null,
        annotationsWrapperStyle: {
          width: 0,
          left: 0,
        },
        lastClick: null,
        nextAnnotation: null,
        clearActiveAnnos: null,
        dragged: {
          wasDragged: false,
          event: null,
        },
        chartOptions: null,
        defaultOptions: {
          type: 'area',
          stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
          },
          fill: {
            colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
            type: 'gradient',
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
              enabled: true,
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
            events: {
              beforeResetZoom: (chartContext, _) => {
                chartContext.toolbar.elZoom.click()
              },
  
              mounted: (_, config) => {
                this.$emit('chart-mounted', config)
                this.addMouseDragListener()
  
                if (!this.withAnnotations || !config.globals.pointsArray.length) {
                  return
                }
  
                this.pointsArrayLength = config.globals.pointsArray[0].length
                let gridWidth = config.globals.gridWidth
                let yAxisOffset = config.globals.translateX
  
                this.annotationsWrapperStyle = {
                  width: `${gridWidth}px`,
                  left: `${yAxisOffset}px`
                }
                
              },
  
              animationEnd: (_, __) => {
                this.$emit('animation-end')
              },
  
              updated: (_, config) => {
                this.$emit('chart-updated', config)
  
                if (!this.withAnnotations) {
                  return
                }
  
                this.chartConfig = {...config.globals}
              },
  
              markerClick: (clickEvent, _, config) => {
                if (this.selectedToolbarElement === 'pan') {
                  this.lastClick = null
                  return
                }
  
                this.$emit('marker-click', config)
  
                if (!this.withAnnotations) return
                let chartGridHeight = config.w.config.chart.height
                let clickYPos = clickEvent.layerY
                
                // click didn't happen within lower 15% of chart so don't
                // initialise an annotation
                if (clickYPos/chartGridHeight * 100 < 85) return
  
                let dataPointIndex = config.dataPointIndex
                let timeMillis = config.w.globals.seriesX[0][dataPointIndex]
                let newAnnoTimezonemillis = dayjs(timeMillis).tz(this.timezone, true).valueOf()
                let i = this.annotations.length
                while (i--) {
                  if (newAnnoTimezonemillis === this.annotations[i].timeMillis) return // an annotation for this data point already exists
                }
  
                let currentViewMinX = config.w.globals.minX
                let xAxisCurrentRange = config.w.globals.xRange
                let gridWidth = config.w.globals.gridWidth
                let leftCalc = this.getNewMarkerLeftVal(timeMillis, currentViewMinX, xAxisCurrentRange, gridWidth)
                
                // Initialises the annotation directly into the edit/create state
                this.lastClick = {
                  leftCalc,
                  timeMillis,
                  visible: true,
                  active: true,
                  status: 1,
                  infoWrapperWidth: 300,
                  body: ''
                }
  
                // When first built, there was a pending state
                // for new annotations (status = 0).
                // Above we are going straight into edit/create state
                // when initialising an annotation. 
                // The custom AnnotationModule remains setup to render this
                // pending state so I will keep the below
                // incase we need to revert at some point.
  
                // this.lastClick = {
                //   leftCalc,
                //   timeMillis,
                //   visible: true,
                //   active: true,
                //   status: 0,
                //   infoWrapperWidth: 215,
                //   body: ''
                // }
              },
  
              mouseMove: (_, chartContext, config) => {
                if (this.tooltipPlacement === 'horizontal') return
                if (this.chartOptions.type === 'bar') return
  
                let innerChartHeight = chartContext.el.querySelector('.apexcharts-inner').getBBox().height
                let tooltip = chartContext.el.querySelector('.apexcharts-tooltip')
                
                let seriesIndex = config.seriesIndex
                let pointsArray = config.globals.pointsArray
                let dataPointIndex = config.dataPointIndex === -1 ? 0 : config.dataPointIndex
  
                if (seriesIndex !== -1) {
                  let positionY = pointsArray[seriesIndex][dataPointIndex][1]
                  let positionX = pointsArray[seriesIndex][dataPointIndex][0]
                  
                  tooltip.style.left = (positionX - 40) + 'px'
                  
                  if (innerChartHeight / 2 < (positionY + (innerChartHeight * 0.12))) {
                    tooltip.style.top = (positionY - 110) + 'px'
                  } else {
                    tooltip.style.top = (positionY + 55) + 'px'
                  }
                }
              },
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
      }
    },
    computed: {
      isCategoryType() {
        return this.chartOptions?.xaxis.type === 'category'
      },
      chartReady() {
        return !!this.chartConfig
      },
    },
    watch: {
      series() {
        if (!this.series || !this.series.length) return
        this.$refs[this.chartId].updateSeries(this.series, false)
      },
      selectedToolbarIcon() {
        this.selectedToolbarElement = this.selectedToolbarIcon
      },
      renderKey() {
        if (this.renderKey) {
          this.key = this.renderKey
        }
      },
      annotations: {
        deep: true,
        handler(newVal, oldVal) {
          if (!this.chartReady) {
            this.chartConfig = {}
          }
          
          if (newVal !== oldVal && this.$refs[this.chartId]) {
            this.chartConfig = this.$refs[this.chartId].chart.w.globals
          }
        }
      },
      
      dragged() {
        if (this.dragged.wasDragged) return
        if (this.isOutsideAnnoClick(this.dragged.event.path)) {
          this.dismissOrSaveAnno()
        }
      },
  
      options() {
        if (!!this.options) {
          this.initChartOptions()
        }
      },
    },  
  
    methods: {
      handleCancelAnnoCreate() {
        // assign an empty object so that the watcher
        // in the annotation module is triggered
        this.clearActiveAnnos = {}
        this.nextAnnotation = null
        this.lastClick = null
      },
      async dismissOrSaveAnno() {
        // occasionally for very slow browsers there is
        // a delay in the lastClick coming through from
        // the window mouseup event listener in which it
        // arrives slightly after the click event from
        // from Apex Charts. The below ensures that should
        // a delay occur we pause briefly to allow it to 
        // come through.
        // This likely won't be an issue in production builds
        // but added as a safety.
        if (!this.lastClick) {
          await waitFor(200)
        }
        if (!this.nextAnnotation && !!this.lastClick) {
          this.nextAnnotation = this.lastClick
          return
        }
  
        this.handleCancelAnnoCreate()      
      },
  
      isOutsideAnnoClick(classes) {
        let length = classes.length
        let i = 0
        while (i < length) {
          if (classes[i].localName === 'svg') i++
          if (classes[i].className === 'annotation-info-wrapper active') return false
  
          i++
        }
        return true
      },
      
      handleToolbarSelection(selection) {
        this.$emit('toolbar-click', selection)
      },
      
      unpackAnnotation(annotation) {
        return annotation.annotation
      },
  
      getNewMarkerLeftVal(markerTimeMillis, currentViewMinX, xAxisCurrentRange, gridWidth) {
        let markerPos = (markerTimeMillis - currentViewMinX) / xAxisCurrentRange
        let leftPxVal = (markerPos * gridWidth) - 10
        return leftPxVal
      },
  
      addMouseDragListener() {
        if (this.hasDragListener) return
  
        const delta = 6
        let startX
        let startY
        let chartEl = this.$refs[this.chartId].$el
        this.$emit('add-drag-listener')
  
        chartEl.addEventListener('mousedown', (event) => {
          startX = event.pageX
          startY = event.pageY
  
          this.mouseDownAdded = true
        })
  
        chartEl.addEventListener('mouseup', (event) => {
          this.mouseUpAdded = true
          let innerChartPosition = document.querySelector('.apexcharts-inner').getClientRects()[0]
          let innerLeft = innerChartPosition.left
          let innerRight = innerChartPosition.right
          let innerTop = innerChartPosition.top
          let innerBottom = innerChartPosition.bottom
  
          let clickXPos = event.clientX
          let clickYPos = event.clientY
  
          // if click is not on inner chart data, dismiss
          if ((clickXPos < innerLeft || clickXPos > innerRight) || (clickYPos < innerTop || clickYPos > innerBottom)) {
            return
          }
          
          const diffX = Math.abs(event.pageX - startX)
          const diffY = Math.abs(event.pageY - startY)
  
          if (diffX > delta && diffY > delta) {
            this.dragged = {
              wasDragged: true,
              event,
            }
          } else {
            this.dragged = { 
              wasDragged: false,
              event,
            }
          }
        })
      },
  
      initChartOptions() {
        let options = this.mergeOptions(this.defaultOptions, this.options)
        let stroke = options.type === 'bar' ? {
          curve: 'smooth',
          width: 3,
          colors: ['transparent'],
        } : {
          curve: 'smooth',
          width: 3,
          colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
        }
        let i = this.series.length
        while (i--) {
          if (options.type === 'bar' && this.series[i].data.length >= 20) {
            stroke = {
              curve: 'smooth',
              width: 0,
              colors: ['#7344c0', '#C96DD8', '#0490ff', '#ff54be', '#2cebb2', '#808cff', '#9f4dab', '#74b5e4'],
            }
          }
        }
        if (stroke) {
          options.stroke = stroke
        }
  
        // if (this.animation) {
        //   options.chart.animations = this.animation
        // }
  
        options.chart.animations = {
          enabled: false,
        },
        
        this.chartOptions = options
        this.$emit('options-update-complete')
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
      this.key = generateRandomString()
    },
  }
  </script>
  <style lang="scss">
  .am2-area-chart {
    &.marginLeft {
      margin-left: -9px;
    }
  }
  
  .apexcharts-zoomin-icon, .apexcharts-zoomout-icon {
    &:hover {
      svg {
        fill: #6E8192 !important;
      }
    }
  }
  
  .apexcharts-selected {
    svg {
      fill: #4e1aa2 !important;
    }
  }
  
  .apexcharts-xaxistooltip {
      opacity: 0 !important;
  }
  
  .apexcharts-toolbar {
    opacity: 0 !important;
  }
  
  .apexcharts-svg {
    &:hover {
    .apexcharts-toolbar {
        opacity: 0 !important;
      }   
    }
  }
  
  .apex-charts-wrapper {
    .sales-chart-loading-wrapper {
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
  .apexcharts-legend-series {
    pointer-events: none;
  }
  </style>