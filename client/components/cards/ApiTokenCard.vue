<template>
    <am2-card-container
      :style="{ padding: $arMediaQuery.pageContent.maxWidth('sm') ? '20px' : '24px 30px' }"
      layout="soft"
    >
      <div>
        <div class="apiToken">
          <div style="display: flex; flex-direction: row;">
          <p style="font-weight: bold;">Token:</p>
          <span style="padding-left: 5px">{{ token }}</span>
        </div>
          <ar-simple-button
            :outlined="false"
            :text="'Revoke Token'"
            :loading="isBeingDeleted"
            :disabled="!active"
            @click="handleRevokeButtonClick"
          />
        </div>
        <div style="display: flex; flex-direction: row;">
          <p style="font-weight: bold;">Created On:</p>
          <span style="padding-left: 5px">{{ createTime }}</span>
        </div>
      </div>
    </am2-card-container>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'ApiTokenCard',
  
    props: {
      token: {
        type: String,
        default: "",
      },
      createTime: {
        type: String,
        default: null,
      },
      active: {
        type: Boolean,
        default: false,
      },
      id: {
        type: Number,
        default: null,
      }
    },
  
    data() {
      return {
        isBeingDeleted: false
      }
    },
  
    methods: {
      ...mapActions([
        'apiToken/REVOKE_API_TOKEN',
      ]),
  
      async handleRevokeButtonClick() {
        this.isBeingDeleted = true;
        await this['apiToken/REVOKE_API_TOKEN'](this.id);
        this.isBeingDeleted = false;
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
    @import '../../../assets/styles/base/mixins';
  .apiToken {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
  
    &.center-align {
      align-items: center;
    }
  }
  </style>
  