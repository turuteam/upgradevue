<template>
    <am2-card-container
      ar-widget-id="am2-swtich-field-card"
      :ar-widget-meta="arWidgetMeta || computedArWidgetMeta"
      :style="{
        padding,
      }"
    >
      <div
        :class="[
          'u-display-flex',
        ]"
        :style="{
          flexFlow: size === 'small' ? 'column-reverse' : null,
        }"
      >
        <div
          :class="[
            'u-flex-grow-1',
            'u-padding-right-3',
          ]"
        >
          <div
            class="u-display-flex u-flex-flow-row"
            :style="{
              marginTop: titleMarginTop,
            }"
          >
            <ar-text
              size="xs"
              :text="title"
              weight="bold"
              :style="{
                color: $arStyle.color.blueGrey800,
              }"
              multiple-lines
            />
            <ar-link-button
              v-if="!!link"
              class="u-margin-left-3"
              :text="link"
              :disabled="linkDisabled"
              @click="$emit('linkClick')"
            />
          </div>
          <ar-text
            v-show="!!subtitle"
            size="xs"
            :text="subtitle"
            multiple-lines
            class="u-margin-top-1"
            :style="{
              color: $arStyle.color.blueGrey700,
            }"
          />
        </div>
        <am2-switch
          :class="[
            size === 'small' ? 'u-margin-bottom-3' : null,
          ]"
          :disabled="disabled"
          @input="handleSwitch"
          :value="value"
        />
      </div>
      <div v-if="displayField" class="u-margin-top-3">
        <slot />
      </div>
    </am2-card-container>
  </template>
  
  
  
  <script>
  export default {
    name: 'TextFieldSwitchCard',
    props: {
      arWidgetMeta: String,
      padding: {
        type: String,
        default: '16px 20px',
      },
      title: {
        type: String,
        default: '',
      },
      subtitle: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      link: {
        type: String,
        default: null,
      },
      linkDisabled: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Boolean,
        default: null
      },
      size: {
        type: String,
        default: 'normal',
        validator: (val) => ['small', 'normal'].indexOf(val) > -1,
      },
      displayField: {
        type: Boolean,
        default: false
      },
    },
  
    computed: {
      computedArWidgetMeta() {
        return [
          `title=${this.title}`,
        ].join('');
      },
      titleMarginTop() {
        if (this.title && !this.subtitle) {
          return '8px';
        }
        return null;
      },
    },
  
    methods: {
      handleSwitch(enabled) {
        this.$emit('input', enabled);
      },
    },
  }
  </script>
  