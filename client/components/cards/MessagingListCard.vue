<template>
    <am2-card-container
      :class="[
        'messaging-list-card',
        showAs,
        messagingList.filterGroupOid && 'dynamic',
        $arMediaQuery.pageContent.maxWidth('sm') && 'sm-max',
      ]"
      @click="handleContentSectionClick"
    >
      <am2-message-list-settings-modal
        title="List Settings"
        :is-show="showMessageListSettingsModal"
        :message-list="messagingList"
        @close="showMessageListSettingsModal = false"
        @update="handleMessageListSettingsConfirm"
      />
      <div class="basic-info-section">
        <div class="basic-info-wrapper">
          <am2-heading
            type="h1"
            size="sm"
            :title="messagingList.name"
            class="message-list-heading"
          />
          <div
            class="u-display-flex u-align-items-center u-margin-top-3"
          >
            <ar-icon
              width="17px"
              name="contacts-alt-two"
              :color="$arStyle.color.blueGrey700"
            />
            <ar-text
              class="u-margin-left-2"
              size="xs"
              :text="contactsCopyMap.text"
              :style="{
                color: $arStyle.color.blueGrey700,
              }"
              v-tooltip="{
                content: contactsCopyMap.tooltip,
              }"
            />
          </div>
        </div>
        <div class="funtion-section">
          <am2-tag
            v-if="messagingList.filterGroupOid"
            v-tooltip.top="{
              content: 'Existing and future contacts that match your segment will automatically be added to this list',
            }"
            text="Dynamic"
            type="purple"
            class="tag"
            :style="{ marginRight: '30px' }"
          />
          <am2-icon-button-dropdown
            :icon-props="{
              name: 'menu',
            }"
            :items="actions"
            :dropdown-style="{
              width: '200px',
            }"
            :dropdown-item-style="{
              height: '41px',
              padding: '0 20px',
            }"
            @select="handleActionSelect"
            :data-test-id="`message-list-card-dropdown-${messageListNameInKebabCase}`"
          />
        </div>
      </div>
      <div class="stats-section">
        <div class="stats-group">
          <!-- Number who have opted into the email channel for this list -->
          <div
            class="stats"
            v-tooltip="{
              content: emailCopyMap.tooltip,
            }"
          >
            <ar-text
              :text="emailCopyMap.text"
              width="18px"
              size="sm"
            />
            <ar-icon
              name="email"
              width="18px"
              :color="$arStyle.color.email"
              :style="{
                marginLeft: '9px',
              }"
            />
          </div>
        </div>
        <div class="stats-group">
          <!-- Number who have opted into the sms channel for this list -->
          <div
            class="stats"
            v-tooltip="{
              content: smsCopyMap.tooltip,
            }"
          >
            <ar-text
              :text="smsCopyMap.text"
              width="18px"
              size="sm"
            />
            <ar-icon
              name="sms"
              width="18px"
              :color="$arStyle.color.sms"
              :style="{
                marginLeft: '9px',
              }"
            />
          </div>
        </div>
      </div>
    </am2-card-container>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  import accounting from 'accounting';
  import { sanitizeHtmlChild } from '@/utils/html-element/';
  
  export default {
    name: 'MessagingListCard',
  
    props: {
      messagingList: {
        type: Object,
        default: () => null,
      },
      showAs: {
        type: String,
        default: 'list',
        validator: function (value) {
          return ['list', 'tiles'].indexOf(value) !== -1;
        },
      },
    },
  
    data() {
      return {
        showMessageListSettingsModal: false,
      };
    },
  
    computed: {
      messageListNameInKebabCase() {
        return this.$arUtils.general.generateDataTestPrettyName(this.messagingList.name);
      },
      actions(){
        const items = [];
        items.push({
          name: 'View',
          key: 'view',
        });
        if (this.messagingList.statsSnapshot && this.messagingList.statsSnapshot.total !== 0) {
          items.push({
            name: 'Download CSV',
            key: 'export_csv',
          });
        }
        items.push({
          name: 'List Settings',
          key: 'setting',
        });
        items.push({
          name: 'Delete',
          key: 'delete',
          typography: {
            style: {
              color: this.$arStyle.color.red500,
            },
          },
        });
        return items;
      },
      contactsCopyMap() {
        const contactsNumber = this.messagingList.statsSnapshot ? this.messagingList.statsSnapshot.total : 0;
        const contactsNumberCopy = accounting.formatNumber(contactsNumber);
        if (!this.messagingList.statsSnapshot || typeof this.messagingList.statsSnapshot.total === 'undefined') {
          return {
            text: `Calculating...`,
            tooltip: `Calculating the number of people in this list. Please wait.`,
          };
        } else if (contactsNumber === 1) {
          return {
            text: `${contactsNumberCopy} person`,
            tooltip: `You have ${contactsNumberCopy} total subscriber in this list`,
          };
        } else {
          return {
            text: `${contactsNumberCopy} people`,
            tooltip: `You have ${contactsNumberCopy} total subscribers in this list`,
          };
        }
      },
      smsCopyMap() {
        let textCopy;
        let tooltipCopy;
        if (!this.messagingList.statsSnapshot || typeof this.messagingList.statsSnapshot.total === 'undefined') {
          textCopy = '-';
          tooltipCopy = `Calculating the number of SMS subscribers in this list. Please wait.`;
        } else if (typeof this.messagingList?.statsSnapshot?.sms?.optedIn !== 'undefined' && this.messagingList.statsSnapshot.sms.optedIn > 0) {
          textCopy = this.generateAbbreviatedNumber(this.messagingList.statsSnapshot.sms.optedIn);
          const smsSubCopy = accounting.formatNumber(this.messagingList.statsSnapshot.sms.optedIn);
          if (this.messagingList.statsSnapshot.sms.optedIn === 1) {
            tooltipCopy = `You have ${smsSubCopy} SMS subscriber in this list.`;
          } else {
            tooltipCopy = `You have ${smsSubCopy} SMS subscribers in this list.`;
          }
        } else if (this.messagingList?.statsSnapshot?.sms && this.messagingList.statsSnapshot.sms > 0) { // TODO - Eventually we can remove this
          textCopy = this.generateAbbreviatedNumber(this.messagingList.statsSnapshot.sms);
          const smsSubCopy = accounting.formatNumber(this.messagingList.statsSnapshot.sms);
          if (this.messagingList.statsSnapshot.sms === 1) {
            tooltipCopy = `You have ${smsSubCopy} SMS subscriber in this list.`;
          } else {
            tooltipCopy = `You have ${smsSubCopy} SMS subscribers in this list.`;
          }
        } else {
          textCopy = "-";
          tooltipCopy = 'You have 0 SMS subscribers in this list';
        }
  
        return {
          text: textCopy,
          tooltip: tooltipCopy,
        };
      },
      emailCopyMap() {
        let textCopy;
        let tooltipCopy;
  
        if (this.messagingList.statsSnapshot && this.messagingList.statsSnapshot.email) {
          textCopy = this.generateAbbreviatedNumber(this.messagingList.statsSnapshot.email);
          const emailSubCountCopy = accounting.formatNumber(this.messagingList.statsSnapshot.email)
          if (!this.messagingList.statsSnapshot || typeof this.messagingList.statsSnapshot.total === 'undefined') {
            tooltipCopy = `Calculating the number of email subscribers in this list. Please wait.`;
          } else if (this.messagingList.statsSnapshot.email === 1) {
            tooltipCopy = `You have ${emailSubCountCopy} email subscriber in this list.`;
          } else {
            tooltipCopy = `You have ${emailSubCountCopy} email subscribers in this list.`;
          }
        } else {
          textCopy = '-';
          tooltipCopy = 'You have 0 email subscribers in this list.';
        }
  
        return {
          text: textCopy,
          tooltip: tooltipCopy,
        };
      }
    },
  
    methods: {
      ...mapActions([
        'messageList/DELETE_MESSAGE_LIST',
        'subscriber/EXPORT_LIST_SUBSCRIBERS_CSV',
        'SHOW_CONFIRM',
      ]),
      generateAbbreviatedNumber(number) {
        if (number < 1e3) {
          return number;
        } else if (number < 1e6) {
          return `${parseFloat(accounting.toFixed(number / 1e3, 1))}K`;
        } else {
          return `${parseFloat(accounting.toFixed(number / 1e6, 1))}M`;
        }
      },
      deleteMessagingList() {
        this['messageList/DELETE_MESSAGE_LIST'](this.messagingList.oid);
      },
      viewMessageList() {
        this.$router.push({
          path: `/message-center/lists/${this.messagingList.oid}/contacts`
        });
      },
      exportCSV() {
        this['subscriber/EXPORT_LIST_SUBSCRIBERS_CSV']({
          messageListOid: this.messagingList.oid,
        });
      },
      async openDeleteMessageListModal() {
        const ans = await this.SHOW_CONFIRM({
          title: 'Delete this list?',
          messageHtml: `You’re about to delete <b>${sanitizeHtmlChild(this.messagingList.name)}</b>, are you sure you want to proceed? The contacts in this list will not be deleted.`,
          confirmButtonText: 'Delete',
          validation: {
            question: 'Type DELETE to confirm',
            answer: 'DELETE',
          },
          asyncCompleteFunction: this.deleteMessagingList,
        });
      },
      handleMessageListSettingsConfirm() {
        this.showMessageListSettingsModal = false;
      },
      handleContentSectionClick() {
        this.viewMessageList();
      },
      handleActionSelect(item) {
        if (item.key === 'delete') {
          this.openDeleteMessageListModal();
        } else if (item.key === 'view') {
          this.viewMessageList();
        } else if (item.key === 'setting') {
          this.showMessageListSettingsModal = true;
        } else if (item.key === 'export_csv') {
          this.exportCSV();
        }
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .messaging-list-card {
    display: flex;
    cursor: pointer;
    border: 1px solid #EDF1F5;
    box-shadow: 2px 5px 10px 0 $message-card-shadow;
  
    &:hover {
      box-shadow: 2px 5px 30px 0 $message-card-shadow;
    }
  
    .basic-info-section {
      position: relative;
      display: flex;
      align-items: center;
      flex-grow: 1;
      border-right: 1px solid $blueGrey400;
      padding: 18px 34px;
      width: 100%;
  
      .basic-info-wrapper {
        max-width: calc(90% - 10px);
  
        .message-list-heading {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
  
      .funtion-section {
        position: absolute;
        top: 50%;
        right: 14px;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
  
        .tag {
          width: 80px;
          height: 30px;
        }
      }
    }
  
    &.sm-max.dynamic {
      .basic-info-section {
        .basic-info-wrapper {
          max-width: calc(90% - 100px);
        }
      }
    }
  
    .stats-section {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-shrink: 0;
      padding: 0 55px 0 10px;
      .stats-group {
        width: 90px;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .stats {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
      }
    }
  
  
    &.tiles {
      flex-direction: column;
      position: relative;
  
      .basic-info-section {
        border-right: none;
        border-bottom: 1px solid $blueGrey500;
        padding: 18px 18px 18px 22px;
      }
  
      .stats-section {
        padding: 24px;
        .stats-group {
          width: unset;
          margin: 0 auto;
        }
      }
    }
  }
  </style>
  