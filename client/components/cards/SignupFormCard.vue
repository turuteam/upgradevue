<template>
    <am2-card-container
      ref="signup-form-card"
      :class="['signup-form-card', size]"
      @click="handleSignupFormCardClick"
      @mouseenter="isBeingHovered = true"
      @mouseleave="isBeingHovered = false"
    >
      <am2-create-campaign-widget-modal
        :is-open="displayCreateCampaignWidgetModal"
        :campaign="signupForm"
        @cancel="displayCreateCampaignWidgetModal = false"
        :is-signup-form="true"
      />
      <div
        :class="['left-section', size]">
        <div
          :class="['left-section-content', size]"
        >
          <div
            class="img-wrapper"
          >
            <div :class="['img-mask', isBeingHovered && 'hovered']">
              <div class="mask-button">
                Edit Form
              </div>
            </div>
            <img
              class="img"
              :src="campaignImageUrl"
            />
          </div>
          <div class="description">
            <ar-text
              size="sm"
              :text="signupForm.name"
            />
            <div
              class="u-display-flex"
              :style="{
                marginTop: '14px',
              }"
            >
              <div
                class="u-display-flex"
                v-tooltip="{
                  content: numRegistrantsCopyMap.tooltip,
                }"
              >
                <ar-icon
                  name="user"
                  width="11px"
                  :color="$arStyle.color.blueGrey700"
                />
                <ar-text
                  class="u-margin-left-1"
                  size="xs"
                  :text="numRegistrantsCopyMap.text"
                  :style="{
                    color: $arStyle.color.blueGrey700,
                  }"
                />
              </div>
              <div
                class="u-display-flex u-margin-left-6"
                v-tooltip="{
                  content: uniqueViewsCopyMap.tooltip,
                }"
              >
                <ar-icon
                  name="preview"
                  width="17px"
                  :color="$arStyle.color.blueGrey700"
                />
                <ar-text
                  class="u-margin-left-2"
                  size="xs"
                  :text="uniqueViewsCopyMap.text"
                  :style="{
                    color: $arStyle.color.blueGrey700,
                  }"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="icon-wrapper">
          <am2-icon-button-dropdown
            :icon-props="{
              name: 'menu',
            }"
            :dropdown-style="{
              width: '200px',
            }"
            :dropdown-item-style="{
              height: '41px',
              padding: '0 20px',
            }"
            :items="actions"
            @select="handleActionSelect"
          />
        </div>
      </div>
      <div
        v-if="hasSummaryStats"
        :class="['right-section', size]"
      >
        <div class="stats">
          <!-- Number who have opted into the email channel for this list -->
          <div
            class="stats-group"
            v-tooltip="{
              content: emailFollowsCopyMap.tooltip,
            }"
          >
            <ar-text
              :text="emailFollowsCopyMap.text"
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
        <div class="stats">
          <!-- Number who have opted into the sms channel for this list -->
          <div
            class="stats-group"
            v-tooltip="{
              content: smsFollowsCopyMap.tooltip,
            }"
          >
             <ar-text
              :text="smsFollowsCopyMap.text"
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
        <div class="stats">
          <!-- Number who have opted into the messenger channel for this list -->
          <div
            class="stats-group"
            v-tooltip="{
              content: messengerFollowsCopyMap.tooltip,
            }"
          >
             <ar-text
              :text="messengerFollowsCopyMap.text"
              width="18px"
              size="sm"
            />
            <ar-icon
              name="messenger"
              width="18px"
              :color="$arStyle.color.messenger"
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
    name: 'SignupFormCard',
    props: {
      signupForm: {
        type: Object,
        required: true,
      },
      size: {
        type: String,
        default: 'list',
        validator: val => ["list", "tile"].includes(val)
      }
    },
    data() {
      return {
        // M.Y: I found it way less complex to handle hover state in JS in our case here
        isBeingHovered: false,
        displayCreateCampaignWidgetModal: false,
        c2ClientDomain: process.env.arCampaignClientDomain,
        actions: [
          {
            name: 'Edit',
            value: 'edit'
          },
          {
            name: 'View Signup Form',
            value: 'view'
          },
          {
            name: 'Download CSV',
            value: 'export_csv'
          },
          {
            name: 'Create Widget',
            value: 'create-widget'
          },
          {
            name: 'Duplicate',
            value: 'duplicate'
          },
          {
            name: 'Delete',
            typography: {
              style: {
                color: this.$arStyle.color.red500,
              },
            },
            value: 'delete'
          },
        ],
        filter: {
          logic: [],
          conditions: [
            {
              name: 'opt_in_forms',
              type: 'condition-search-picker',
              data: {
                condition: 'true_to_all',
                values: [ this.signupForm.oid ]
              }
            }
          ]
        }
      };
    },
    computed: {
      campaignImageUrl() {
        const resource = this.signupForm.resources.filter(item => item.assetType === 'campaign-image');
        if (!resource || !resource[0] || !resource[0].url) return null;
        return resource[0].url;
      },
      numRegistrantsCopyMap() {
        if (!this.signupForm.summaryStats) {
          return null;
        }
  
        // A.R. 2022-08-29 Temporarily commenting this out until allRegistrations is fixed
        //const numRegistrations = accounting.formatNumber(this.signupForm.summaryStats.allRegistrations || 0);
        const numRegistrations = Math.max(this.signupForm.summaryStats.emailFollows || 0, this.signupForm.summaryStats.smsFollows || 0)
  
        if (this.signupForm.summaryStats.allRegistrations === 1) {
          return {
            text: `${numRegistrations} submission`,
            tooltip: `${numRegistrations} person has successfully submitted this Signup Form`,
          };
        } else {
          return {
            text: `${numRegistrations} submissions`,
            tooltip: `${numRegistrations} people have successfully submitted this Signup Form`,
          };
        }
      },
      uniqueViewsCopyMap() {
        if (!this.signupForm.summaryStats) {
          return null;
        }
  
        const uniqueViews = accounting.formatNumber(this.signupForm.summaryStats.uniqueViews || 0);
        if (this.signupForm.summaryStats.uniqueViews === 1) {
          return {
            text: `${uniqueViews} view`,
            tooltip: `${uniqueViews} person has viewed this Signup Form`,
          };
        } else {
          return {
            text: `${uniqueViews} views`,
            tooltip: `${uniqueViews} people have viewed this Signup Form`,
          };
        }
      },
      hasSummaryStats() {
        return !!this.signupForm.summaryStats;
      },
      isSmsAvailable() {
        return !!this.signupForm.socialActions.socialAccounts[0].sms;
      },
      smsFollowsCopyMap() {
        let textCopy;
        let tooltipCopy;
        if (this.signupForm.summaryStats && this.signupForm.summaryStats.smsFollows) {
          textCopy = this.generateAbbreviatedNumber(this.signupForm.summaryStats.smsFollows);
          const smsFollowsCopy = accounting.formatNumber(this.signupForm.summaryStats.smsFollows);
          if (this.signupForm.summaryStats.smsFollows === 1) {
            tooltipCopy = `${smsFollowsCopy} person has subscribed to SMS using this form`;
          } else {
            tooltipCopy = `${smsFollowsCopy} people have subscribed to SMS using this form`;
          }
        } else {
          textCopy = "-";
          tooltipCopy = '0 people have subscribed to SMS using this form';
        }
  
        return {
          text: textCopy,
          tooltip: tooltipCopy,
        };
      },
      isMessengerAvailable() {
        return !!this.signupForm.socialActions.socialAccounts[0]['facebook:messenger'];
      },
      messengerFollowsCopyMap() {
        let textCopy;
        let tooltipCopy;
  
        if (this.signupForm.summaryStats && this.signupForm.summaryStats.messengerFollows) {
          textCopy = this.generateAbbreviatedNumber(this.signupForm.summaryStats.messengerFollows);
          const messengerFollowsCopy = accounting.formatNumber(this.signupForm.summaryStats.messengerFollows);
          if (this.signupForm.summaryStats.messengerFollows === 1) {
            tooltipCopy = `${messengerFollowsCopy} person has subscribed to Facebook Messenger using this form`;
          } else {
            tooltipCopy = `${messengerFollowsCopy} people have subscribed to Facebook Messenger using this form`;
          }
        } else {
          textCopy =  '-';
          tooltipCopy = `0 people have subscribed to Facebook Messenger using this form`;
  
        }
  
        return {
          text: textCopy,
          tooltip: tooltipCopy,
        };
      },
      isEmailAvailable() {
        return !!this.signupForm.socialActions.socialAccounts[0].email;
      },
      emailFollowsCopyMap() {
        let textCopy;
        let tooltipCopy;
  
        if (this.signupForm.summaryStats && this.signupForm.summaryStats.emailFollows) {
          textCopy = this.generateAbbreviatedNumber(this.signupForm.summaryStats.emailFollows);
          const emailFollowsCopy = accounting.formatNumber(this.signupForm.summaryStats.emailFollows);
          if (this.signupForm.summaryStats.emailFollows === 1) {
            tooltipCopy = `${emailFollowsCopy} person has subscribed to email using this form`;
          } else {
            tooltipCopy = `${emailFollowsCopy} people have subscribed to email using this form`;
          }
        } else {
          textCopy = '-';
          tooltipCopy = '0 people have subscribed to email using this form';
        }
  
        return {
          text: textCopy,
          tooltip: tooltipCopy,
        };
      },
    },
    mounted() {
  
    },
    methods: {
      ...mapActions([
        'signupForm/CLONE_SIGNUP_FORM',
        'SHOW_CONFIRM',
        'signupForm/DELETE_SIGNUP_FORM',
        'audience/EXPORT_AUDIENCE_CSV',
      ]),
  
      handleExportClick() {
        this['audience/EXPORT_AUDIENCE_CSV'](
          {
            filter: this.filter,
            selectKeys: ['emailAddress', 'firstName', 'lastName', 'mobileNumber', 'dob', 'postcode', 'city', 'state', 'country'],
            orderBy: { key: 'emailAddress', order: 'asc' },
          }
        );
      },
      generateAbbreviatedNumber(number) {
        if (number < 1e3) {
          return number;
        } else if (number < 1e6) {
          return `${parseFloat(accounting.toFixed(number / 1e3, 1))}K`;
        } else {
          return `${parseFloat(accounting.toFixed(number / 1e6, 1))}M`;
        }
      },
      async cloneSignupForm() {
        const succeed = await this['signupForm/CLONE_SIGNUP_FORM'](this.signupForm.oid);
        if (succeed) {
          this.$emit('clone');
        }
      },
      goToSignupForm() {
        window.open(`${this.c2ClientDomain}/m/${this.signupForm.urlSlug}`, '_blank');
      },
      goEditSignupForm() {
        this.$router.push({
          path: `/message-center/signup-forms/${this.signupForm.oid}/edit/basic`,
        });
      },
      async deleteSignupForm() {
        await this.SHOW_CONFIRM({
          messageHtml: `Are you sure you want to delete the signup form<br /><b>${sanitizeHtmlChild(this.signupForm.name)}</b>?`,
          asyncCompleteFunction: async () => { await this['signupForm/DELETE_SIGNUP_FORM'](this.signupForm); },
        });
      },
      openCreateWidgetModal() {
        this.displayCreateCampaignWidgetModal = true;
      },
      handleSignupFormCardClick() {
        this.goEditSignupForm();
      },
      async handleActionSelect(item) {
        if (item.value === 'edit') {
          this.goEditSignupForm();
        } else if (item.value === 'duplicate') {
          this.cloneSignupForm();
        } else if (item.value === 'delete') {
          this.deleteSignupForm();
        } else if (item.value === 'view') {
          this.goToSignupForm();
        } else if (item.value === 'create-widget') {
          this.openCreateWidgetModal();
        } else if (item.value === 'export_csv') {
          this.handleExportClick();
        }
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .signup-form-card {
    display: flex;
    cursor: pointer;
    border: 1px solid #EDF1F5;
    box-shadow: 2px 5px 10px 0 $message-card-shadow;
  
    &:hover {
      box-shadow: 2px 5px 30px 0 $message-card-shadow;
    }
  
    &.tile {
      height: auto;
      flex-direction: column;
    }
  
  
    &.list {
      height: 80px;
      flex-direction: row;
    }
  
    .left-section {
      position: relative;
      border-right: 1px solid $blueGrey400;
      height: 100%;
      /*flex-shrink: 1;*/
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
  
      &.tile {
        flex-direction: column;
        border: none;
        .icon-wrapper {
          position: absolute;
          right: 10px;
          bottom: 12px;
        }
      }
      &.list {
        .left-section-content {
          max-width: calc(100% - 32px);
        }
        .icon-wrapper {
          padding-right: 6px;
        }
        .description {
          max-width: calc(100% - 206px);
        }
      }
  
      .left-section-content {
        height: 100%;
        display: flex;
        flex-grow: 1;
        transition: box-shadow 0.3s;
  
        .img-wrapper {
          position: relative;
          height: 100%;
          min-width: 145px;
          align-self: flex-start;
          background-color: #2B214A;
  
          .img-mask {
            transition: opacity 0.015s ease-in;
            position: absolute;
            left: 0;
            top: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            background: $dark-hover-overlay;
            opacity: 0;
            z-index: $zIndexRegular;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
  
            .mask-button {
              color: #fff;
              content: 'View Results';
              padding: 9px 12px;
              border: 1px solid #fff;
              border-radius: 3px;
              font-size: 13px;
              font-weight: bold;
              white-space: nowrap;
            }
  
            &.hovered {
              opacity: 1;
            }
          }
  
          .img {
            position: relative;
            height: 100%;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
          }
        }
        &.tile {
          flex-direction: column;
          width: 100%;
  
          .img-wrapper {
            height: auto;
            width: 100%;
            margin-bottom: 12px;
            .img {
              height: auto;
              width: 100%;
            }
          }
        }
        .description {
          display: flex;
          padding: 0 21px;
          flex-direction: column;
          justify-content: center;
        }
      }
    }
  
    .right-section {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-shrink: 0;
  
      .stats {
        width: 90px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        .stats-group {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
      }
  
      &.list {
        padding: 0 55px 0 10px;
      }
  
      &.tile {
        border-top: 1px solid $blueGrey500;
        margin-top: 24px;
        padding: 24px;
        justify-content: space-between;
  
        .stats {
          width: unset;
          margin: 0 auto;
        }
      }
    }
  
  }
  </style>
  