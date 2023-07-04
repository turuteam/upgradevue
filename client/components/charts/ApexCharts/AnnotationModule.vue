<template>
    <div
        v-if="withAnnotations"
        class="annotations-wrapper"
        :style="{...{
          ...styles,
          ...annotationsWrapperStyle
        }}"
      >
      <div v-for="(annotation, index) in adjustedAnnotations" :key="index" class="annotation-wrapper">
        <div
          v-if="annotation.visible"
          class="annotation-info-wrapper"
          :class="annotation.active ? 'active' : 'hidden'"
          :style="{
            left: `${getAnnotationInfoStyle(annotation)}px`,
            width: `${annotation.infoWrapperWidth}px`
          }"
        >
          <slot :annotation="annotation">
            <div 
              class="triangle"
              :style="{
                left: `${annotation.width / 2 - 5}px`
              }"
            >
              <div class="triangle-outer"></div>
              <div class="triangle-inner"></div>
            </div>
            <div v-if="annotation.status === 3" class="annotation-edit-wrapper">
              <div class="annotation-edit-container">
                <div class="annotation-header-wrapper">
                  <div class="annotation-header-left-wrapper">
                    <div class="annotation-circle" />
                    <ar-text
                      class="annotation-heading"
                      size="12px"
                      text="Annotation"
                      multiple-lines
                      :max-lines="1"
                      line-height="12px"
                      weight="bold"
                    />
                    <ar-text
                      class="annotation-date"
                      size="12px"
                      :text="`-  ${monthDayYear(annotation.timeMillis)}`"
                      multiple-lines
                      :max-lines="1"
                      line-height="12px"
                    />
                  </div>
                  <div class="close-icon-wrapper" @click="cancelAnnoEdit(annotation)" data-test-id="cancel-update-annotation-button">
                    <div class="close-icon" />
                  </div>
                </div>
                <textarea
                  class="edit-annotation-textarea"
                  v-model="annotation.body"
                  rows="3"
                  placeholder="Enter your annotation here…"
                  data-test-id="edit-annotation-textarea"
                />
                <div class="edit-actions-wrapper">
                  <ar-simple-button
                    class="update-annotation-button"
                    text="Save"
                    :style="{
                      padding: '13px 16px',
                      height: 'unset',
                      width: '102px',
                      marginRight: '8px'
                    }"
                    @click="updateAnnotation(annotation)"
                    data-test-id="update-annotation-button"
                  />
                  <ar-link-button
                    class="annotation-delete-button"
                    text="Delete"
                    :has-underline="true"
                    :color="$arStyle.color.$purple500"
                    @click="deleteAnnotation(annotation)"
                    data-test-id="delete-annotation-button"
                  />
                </div>
              </div>
            </div>
            <div 
              v-if="annotation.status === 2" 
              class="saved-annotation-wrapper"
              @mouseleave="removeActiveState(annotation.oid)"
            >
              <div 
                class="annotation-container"
                @click="updateToEditState(annotation)"
                data-test-id="update-annotation-trigger-div"
              >
                <div class="annotation-header-wrapper">
                  <div class="annotation-header-left-wrapper">
                    <div class="annotation-circle" />
                    <ar-text
                      class="annotation-heading"
                      size="12px"
                      text="Annotation"
                      multiple-lines
                      :max-lines="1"
                      line-height="12px"
                      weight="bold"
                    />
                    <ar-text
                      class="annotation-date"
                      size="12px"
                      :text="`-  ${monthDayYear(annotation.timeMillis)}`"
                      multiple-lines
                      :max-lines="1"
                      line-height="12px"
                    />
                  </div>
                  <ar-link-button
                    class="annotation-edit-button"
                    text="edit"
                    :has-underline="true"
                    :color="$arStyle.color.$purple500"
                    @click="updateToEditState(annotation)"
                    data-test-id="update-annotation-trigger-button"
                    :text-props="{
                      size: '12px'
                    }"
                  />
                </div>
                <ar-text
                  class="annotation-description"
                  size="14px"
                  :text="annotation.body"
                  multiple-lines
                  line-height="14px"
                  weight="bold"
                />
              </div>
            </div>
            <div v-if="annotation.status === 1" class="create-annotation-wrapper">
              <div class="close-icon-wrapper" @click="closeAnnoCreate(index)" data-test-id="close-annotation-create-button">
                <div class="close-icon"/>
              </div>
              <div class="create-annotation-container">
                <div class="create-annotation-header-wrapper">
                  <div class="annotation-circle" />
                  <ar-text
                    class="annotation-heading"
                    size="12px"
                    text="Annotation"
                    multiple-lines
                    :max-lines="1"
                    line-height="12px"
                    weight="bold"
                  />
                  <ar-text
                    class="annotation-date"
                    size="12px"
                    :text="`-  ${monthDayYear(annotation.timeMillis)}`"
                    multiple-lines
                    :max-lines="1"
                    line-height="12px"
                  />
                </div>
                <textarea
                  class="create-annotation-textarea"
                  v-model="annotation.body"
                  rows="3"
                  placeholder="Enter your annotation here…"
                  data-test-id="create-annotation-textarea"
                />
                <ar-simple-button
                  class="create-annotation-button"
                  text="Save"
                  :style="{
                    padding: '13px 16px',
                    height: 'unset',
                  }"
                  @click="createAnnotationHandler(annotation)"
                  data-test-id="create-annotation-button"
                />
              </div>
            </div>
            <div v-if="annotation.status === 0" class="confirm-create-annotation-wrapper">
              <div class="close-icon-wrapper" @click="closeAnnoCreate(index)" data-test-id="cancel-create-annotation-button">
                <div class="close-icon" />
              </div>
              <div
                class="confirm-create-copy-wrapper"
                @click="confirmAddAnno(annotation)"
                data-test-id="confirm-create-annotation-div"
              >
                <ar-text
                  class="confirm-create-date"
                  size="14px"
                  :text="monthDayYear(annotation.timeMillis)"
                  multiple-lines
                  :max-lines="1"
                  line-height="20px"
                />
                <ar-text
                  class="confirm-create-copy"
                  size="12px"
                  text="Click to add annotation"
                  multiple-lines
                  :max-lines="1"
                  line-height="20px"
                />
              </div>
            </div>
          </slot>
        </div>
        <am2-apex-annotation-marker
          v-if="annotation.visible"
          :styles="{
            left: `${annotation.leftCalc}px`,
            background: handleMarkerBgColor(annotation)
          }"
          @mouseover="addActiveState(index)"
        />
      </div>
    </div>
  </template>
  <script>
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone'
  import localizedFormat from 'dayjs/plugin/localizedFormat'
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(localizedFormat)
  
  export default {
    name: 'AnnotationModule',
    props: {
      annotations: {
        type: Array,
        default: () => []
      },
      annotationHandlers: {
        type: Object,
        default: null
      },
      nextAnnotation: {
        type: Object,
        default: null,
      },
      chartConfig: {
        type: Object,
        default: null,
      },
      styles: {
        type: Object,
        default: () => {}
      },
      withAnnotations: {
        type: Boolean,
        default: false,
      },
      timezone: {
        type: String,
        default: null,
      },
      clearActive: {
        type: Object,
        default: null,
      }
    },
    data() {
      return {
        adjustedAnnotations: [],
        createdAnnoDateTime: null,
        annotationsWrapperStyle: {},
      }
    },
    watch: {
      chartConfig() {
        if (this.chartConfig.gridWidth) {
          this.handleChartUpdateOrResize()
        }
      },
      annotations: {
        deep: true,
        handler(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.handleRecalcOfAnnotations()
          }
        }
      },
      nextAnnotation() {
        this.setCustomAnnotation()
      },
      clearActive() {
        this.clearActiveAnnotations()
      }
    },
    computed: {
      activeAnnotations() {
        return this.adjustedAnnotations.filter(anno => anno.active)
      }
    },
    methods: {
      clearActiveAnnotations() {
        let newAdjusted = []
        let length = this.adjustedAnnotations.length
        let i = 0
        while (i < length) {
          if (this.adjustedAnnotations?.[i].oid) {
            this.adjustedAnnotations[i].active = false
            this.adjustedAnnotations[i].status = 2
            newAdjusted.push(this.adjustedAnnotations[i])
          }
  
          i++
        }
  
        this.adjustedAnnotations = newAdjusted
      },
      cancelAnnoEdit(annotation) {
        annotation.status = 2
        annotation.infoWrapperWidth = 315
        annotation.active = false
      },
      getNewMarkerLeftVal(markerTimeMillis, currentViewMinX, xAxisCurrentRange, gridWidth, diff = 0) {
        let markerPos = (markerTimeMillis - currentViewMinX - diff) / xAxisCurrentRange
        let leftPxVal = (markerPos * gridWidth) - 10
        return leftPxVal
      },
      handleChartUpdateOrResize() {
        let gridWidth = this.chartConfig.gridWidth
        let yAxisOffset = this.chartConfig.translateX
  
        if (gridWidth && yAxisOffset) {
          this.annotationsWrapperStyle = {
            width: `${gridWidth}px`,
            left: `${yAxisOffset}px`
          }
        }
  
        let currentViewMaxX = this.chartConfig.maxX
        let currentViewMinX = this.chartConfig.minX
        let xAxisCurrentRange = this.chartConfig.xRange
        
        let adjustedAnnotations = []
  
        let i = this.adjustedAnnotations.length
        while (i--) {
          let markerMillis = this.adjustedAnnotations[i].timeMillis
          let markerMillisNewTz = dayjs(this.adjustedAnnotations[i].timeMillis).tz(this.timezone, true).valueOf()
          let diff = markerMillisNewTz - markerMillis
          if ((markerMillis - diff) >= currentViewMinX && (markerMillis - diff) <= currentViewMaxX) {
            let newMarkerLeftVal = this.getNewMarkerLeftVal(markerMillis, currentViewMinX, xAxisCurrentRange, gridWidth, diff)
            adjustedAnnotations.push({
              ...this.adjustedAnnotations[i],
              leftCalc: newMarkerLeftVal,
              visible: true,
              active: this.setActiveStatus(this.adjustedAnnotations[i].status),
            })
          } else {
            adjustedAnnotations.push({
              ...this.adjustedAnnotations[i],
              visible: false,
              active: this.setActiveStatus(this.adjustedAnnotations[i].status),
            })
          }
        }
  
        this.adjustedAnnotations = adjustedAnnotations
      },
      setActiveStatus(status) {
        return (status === 0 || status === 1) ? true : false
      },
      handleRecalcOfAnnotations() {
        if (!this.chartConfig) return
  
        let gridWidth = this.chartConfig.gridWidth
  
        let currentViewMinX = this.chartConfig.minX
        let xAxisCurrentRange = this.chartConfig.xRange
  
        let adjustedAnnotations = []
        let newMarkerLeftVal
        let i = this.annotations.length
        while (i--) {
          let markerMillis = this.annotations[i].timeMillis
          let markerMillisNewTz = dayjs(this.annotations[i].timeMillis).tz(this.timezone, true).valueOf()
          let diff = markerMillis === this?.createdAnnoDateTime?.timeMillis ? 0 : markerMillisNewTz - markerMillis
  
          newMarkerLeftVal = this.getNewMarkerLeftVal(markerMillis, currentViewMinX, xAxisCurrentRange, gridWidth, diff)
          
          adjustedAnnotations.push({
            ...this.annotations[i],
            leftCalc: newMarkerLeftVal,
            visible: true,
            active: false
          })
        }
  
        this.adjustedAnnotations = adjustedAnnotations
      },
      setCustomAnnotation() {
        // if last annotation is a temporary one, ie, doesn't
        // have an oid, delete the temporary annotation
        if (!!this.adjustedAnnotations.length && !this.adjustedAnnotations?.[this.adjustedAnnotations.length - 1]?.oid && !!this.nextAnnotation) {
          this.adjustedAnnotations = this.adjustedAnnotations.slice(0, this.adjustedAnnotations.length - 1)
          return
        }
  
        if (!this.nextAnnotation) {
          return
        }
  
        let prevTempAnnoIndex
        let i = this.adjustedAnnotations.length
        while (i--) {
          if (this.adjustedAnnotations[i].timeMillis === this.nextAnnotation.timeMillis) {
            return
          }
          if (!this.adjustedAnnotations[i]?.oid) { prevTempAnnoIndex = i }
        }
  
        // previously we kept all the pending annotations on the chart.
        // below we are removing the last pending so to only have one
        // temp/pending annotation on the chart at a time.
        // to revert to show all pending annotations replace the below with
        // this.adjustedAnnotations = [
        //   ...this.adjustedAnnotations,
        //  this.nextAnnotation, 
        // ]
        this.adjustedAnnotations = [
          ...this.adjustedAnnotations.slice(0, prevTempAnnoIndex),
         this.nextAnnotation,
        ]
      },
      async createAnnotationHandler(annotation) {
        this.createdAnnoDateTime = {
          timeMillis: annotation.timeMillis,
          timezone: this.timezone,
        }
        
        await this.annotationHandlers.create({
          ...annotation,
          // making sure to convert annotation millis to currently viewed timezone
          timeMillis: dayjs(annotation.timeMillis).tz(this.timezone, true).valueOf()
        })
      },
      async updateAnnotation(annotation) {
        await this.annotationHandlers.update(annotation)
        
        annotation.status = 2
        annotation.infoWrapperWidth = 315
      },
      async deleteAnnotation(annotation) {
        await this.annotationHandlers.delete(annotation.oid)
        this.removeAnnotationLocally(annotation)
      },
      removeAnnotationLocally(annotation) {
        this.adjustedAnnotations = this.adjustedAnnotations.filter(anno => {
          return anno.oid !== annotation.oid
        })
      },
      removeActiveState(oid) {
        let anno = this.adjustedAnnotations.find(anno => anno.oid === oid)
        anno.active = false
      },
      updateToEditState(annotation) {
        annotation.status = 3
        annotation.infoWrapperWidth = 300
        this.$nextTick(() => {
          document.querySelector('.edit-annotation-textarea').focus()
        })
      },
      getAnnotationInfoStyle(annotation) {
        let markerCircleCentre = 10 // half of 20px width
        return annotation.leftCalc - (annotation.infoWrapperWidth / 2) + markerCircleCentre
      },
      closeAnnoCreate(index) {
        let annotations = this.adjustedAnnotations.filter((_, idx) => {
          return idx !== index
        })
        this.adjustedAnnotations = annotations
        this.$emit('cancel-create')
      },
      confirmAddAnno(annotation) {
        annotation.status = 1
        annotation.infoWrapperWidth = 300
        this.$nextTick(() => {
          document.querySelector('.create-annotation-textarea').focus()
        })
      },
      monthDayYear(timeMillis) {
        return dayjs(timeMillis).tz(this.timezone).format('LL')
      },
      handleMarkerBgColor(annotation) {
        let color
        switch (annotation.status) {
          case 0:
            color = '#8F94A2'
            break
          case 1:
          case 2:
            // when we know what colours will exist for
            // historical annotations, extract this away
            // to a function
            color = annotation.type === 'custom' ? '#FFC300' : 'dodgerblue'
          case 3:
            color = '#FFC300'
            break
          default:
            color = '#8F94A2'
        }
  
        return color
      },
      addActiveState(index) {
        this.adjustedAnnotations[index].active = true
      },
    }
  }
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
  
  .annotations-wrapper {
      // background: #7fffd4a8;
      height: 30px;
      position: absolute;
      bottom: 0px;
  
      .annotation-wrapper {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 99;
  
        &:hover {
          z-index: 30;
        }
  
        .annotation-info-wrapper {
          background: white;
          position: absolute;
          bottom: 55px;
          border-radius: 5px;
          border: 1px solid #D4D8E1;
          box-shadow: 0 3px 13px -2px rgba(0, 0, 0, 0.3);
          @include flexRow;
          align-items: center;
          justify-content: center;
  
          &:hover {
            box-shadow: 0 3px 13px -2px rgba(0, 0, 0, 0.4);
          }
  
          &.hidden {
            display: none;
          }
  
          .triangle {
            position: absolute;
            width: 10px;
            bottom: -5px;
            transform: rotate(180deg);
  
            .triangle-outer {
              position: absolute;
              top: 0;
              left: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-bottom: 5px solid $skyBlueGrey500;
            }
  
            .triangle-inner {
              position: absolute;
              top: 1px;
              left: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-bottom: 5px solid white;
              transform: translateY(10%);
            }
          }
  
          .confirm-create-annotation-wrapper {
            text-align: center;
            cursor: pointer;
            @include flexRow;
            align-items: center;
            justify-content: center;
            width: 100%;
  
            .close-icon-wrapper {
              position: absolute;
              top: 2px;
              right: 2px;
              padding: 6px 6px 5px 5px;
              cursor: pointer;
  
              .close-icon {
                background: url('~assets/icons/close-cross-icon.svg') no-repeat;
                background-size: contain;
                width: 12px;
                height: 12px;
              }
            }
  
            .confirm-create-copy-wrapper {
              padding: 10px;
              @include flexCol;
              align-items: center;
              width: 100%;
  
              .confirm-create-date {
                color: $blueGrey800;
              }
  
              .confirm-create-copy {
                color: $blueGrey600;
              }
            }
          }
  
          .create-annotation-wrapper {
            width: 100%;
            @include flexRow;
            align-items: center;
            justify-content: center;
            position: relative;
  
            .close-icon-wrapper {
              position: absolute;
              top: 2px;
              right: 2px;
              padding: 17px 9px 5px 5px;
              cursor: pointer;
  
              .close-icon {
                background: url('~assets/icons/close-cross-icon.svg') no-repeat;
                background-size: contain;
                width: 12px;
                height: 12px;
              }
            }
  
            .create-annotation-container {
              width: 94%;
              @include flexCol;
              align-items: center;
              padding: 10px 0;
  
              .create-annotation-header-wrapper {
                @include flexRow;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                margin-bottom: 20px;
                margin-top: 10px;
  
                .annotation-circle {
                  width: 12px;
                  height: 12px;
                  background: #FFC300;
                  border-radius: 10px;
                  margin-right: 8px;
                }
  
                .annotation-heading, .annotation-date {
                  color: $skyBlueGrey700;
                }
  
                .annotation-heading {
                  margin-right: 4px;
                }
              }
  
              .create-annotation-textarea {
                width: 100%;
                border: 1px solid #d7d7d7;
                resize: none;
                border-radius: 5px;
                color: $blueGrey800;
                font-size: 14px;
                line-height: 20px;
                font-size: 14px;
                padding: 5px 10px;
                outline: none;
                margin-bottom: 10px;
  
                &::-webkit-input-placeholder {
                  /* WebKit, Blink, Edge */
                  color: $blueGrey600;
                }
                &:-moz-placeholder {
                  /* Mozilla Firefox 4 to 18 */
                  color: $blueGrey600;
                }
                &::-moz-placeholder {
                  /* Mozilla Firefox 19+ */
                  color: $blueGrey600;
                }
                &:-ms-input-placeholder {
                  /* Internet Explorer 10-11 */
                  color: $blueGrey600;
                }
                &::-ms-input-placeholder {
                  /* Microsoft Edge */
                  color: $blueGrey600;
                }
              }
  
              .create-annotation-button {
                width: 100%;
              }
            }
          }
  
          .saved-annotation-wrapper {
            width: 100%;
            @include flexRow;
            align-items: center;
            justify-content: center;
            position: relative;
            min-height: 104px;
  
            &.active {
              display: flex;
            }
  
            &.hidden {
              display: none;
            }
  
            .annotation-container {
              width: 100%;
              padding: 10px 17px;
              @include flexCol;
              align-items: flex-start;
              min-height: inherit;
              cursor: pointer;
  
              .annotation-header-wrapper {
                @include flexRow;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 15px;
                margin-top: 8px;
  
                .annotation-header-left-wrapper {
                  @include flexRow;
                  align-items: center;
                  justify-content: flex-start;
                  
                  .annotation-circle {
                    width: 12px;
                    height: 12px;
                    background: #FFC300;
                    border-radius: 10px;
                    margin-right: 8px;
                  }
  
                  .annotation-heading, .annotation-date {
                    color: $skyBlueGrey700;
                  }
  
                  .annotation-heading {
                    margin-right: 4px;
                  }
                }
              }
  
              .annotation-description {
                margin-bottom: 8px;
              }
            }
          }
  
          .annotation-edit-wrapper {
            width: 100%;
            @include flexRow;
            align-items: center;
            justify-content: center;
            position: relative;
  
            .annotation-edit-container {
              width: 100%;
              padding: 10px 9px;
              @include flexCol;
              align-items: flex-start;
              min-height: inherit;
  
              .annotation-header-wrapper {
                @include flexRow;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 15px;
                margin-top: 8px;
  
                .annotation-header-left-wrapper {
                  @include flexRow;
                  align-items: center;
                  justify-content: flex-start;
                  
                  .annotation-circle {
                    width: 12px;
                    height: 12px;
                    background: #FFC300;
                    border-radius: 10px;
                    margin-right: 8px;
                  }
  
                  .annotation-heading, .annotation-date {
                    color: $skyBlueGrey700;
                  }
  
                  .annotation-heading {
                    margin-right: 4px;
                  }
                }
  
                .close-icon-wrapper {
                  position: absolute;
                  top: 11px;
                  right: 5px;
                  padding: 6px 6px 5px 5px;
                  cursor: pointer;
  
                  .close-icon {
                    background: url('~assets/icons/close-cross-icon.svg') no-repeat;
                    background-size: contain;
                    width: 12px;
                    height: 12px;
                  }
                }
              }
  
              .edit-annotation-textarea {
                width: 100%;
                border: 1px solid #d7d7d7;
                resize: none;
                border-radius: 5px;
                color: $blueGrey800;
                font-size: 14px;
                line-height: 20px;
                font-size: 14px;
                padding: 5px 10px;
                outline: none;
                margin-bottom: 10px;
  
                &::-webkit-input-placeholder {
                  /* WebKit, Blink, Edge */
                  color: $blueGrey600;
                }
                &:-moz-placeholder {
                  /* Mozilla Firefox 4 to 18 */
                  color: $blueGrey600;
                }
                &::-moz-placeholder {
                  /* Mozilla Firefox 19+ */
                  color: $blueGrey600;
                }
                &:-ms-input-placeholder {
                  /* Internet Explorer 10-11 */
                  color: $blueGrey600;
                }
                &::-ms-input-placeholder {
                  /* Microsoft Edge */
                  color: $blueGrey600;
                }
              }
            }
          }
        }
      }
    }
  </style>