<template>
    <div
      :class="['ar-profile-avatar', type]"
      @click="handleAvatarClick"
      :style="{ width: size, minWidth: size, height: size }">
      <img v-if="imagePath && !imageLoadingError" :src="imagePath" @error="handleImageLoadingError" :style="customImageStyle">
      <div v-else class="name-section">
        <ar-text
          class="name-text"
          :size="avatarTextSize"
          :text="columnDataAsInitials(nameString)"
          align="center"
          weight="bold"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Avatar',
    props: {
      imagePath: {
        type: String,
        default: '',
      },
      name: {
        type: [Object, String],
        default: '',
      },
      type: {
        type: String,
        default: 'grey',
        validator: (value) =>
          ['grey', 'white', 'bordered'].indexOf(value) !== -1,
      },
      size: {
        type: String,
        default: '40px',
      },
      link: {
        type: String,
        default: null,
      },
      avatarTextSize: {
        type: String,
        default: 'xs',
        validator: (value) =>
          ['xs', 'sm', 'md', 'lg'].indexOf(value) !== 1,
      },
      imageStyle: {
        type: Object,
        default: () => {},
      }
    },
    data() {
      return {
        imageLoadingError: false,
      };
    },
    computed: {
      nameString() {
        if (!this.name) {
          return null;
        }
        if (typeof this.name === 'string') {
          return this.name;
        }
        return `${this.name.firstName} ${this.name.lastName}`;
      },
      customImageStyle() {
        return {
          ...this.imageStyle,
        }
      },
    },
    methods: {
      handleImageLoadingError() {
        this.imageLoadingError = true;
      },
      columnDataAsInitials(name) {
        if (!name) {
          return null;
        }
        const names = name.trim().split(' ');
        if (!names || names.length === 0) {
          return '';
        }
        const initialOne = `${names[0] ? names[0][0] : ''}`;
        if (names.length === 1) {
          return initialOne;
        }
  
        const initialTwo = `${names[names.length - 1] ? names[names.length - 1][0] : ''}`;
        return `${initialOne}${initialTwo}`;
      },
      handleAvatarClick() {
        if (!this.link) return;
        this.$router.push(this.link);
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .ar-profile-avatar {
    display: inline-flex;
    border-radius: 50%;
    overflow: hidden;
  
    .name-section {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
  
      .name-text {
        text-transform: uppercase;
      }
    }
  
    &.grey {
      background-color: $skyBlueGrey400;
  
      .name-section > .name-text{
        color: $blueGrey700;
      }
    }
  
    &.white {
      background-color: white;
  
      .name-section > .name-text {
        color: $blueGrey800;
      }
    }
  
    &.bordered {
      border: 2px solid #FFF;
    }
  
    img {
      width: 100%;
      height: 100%;
    }
  }
  </style>
  