<template>
  <div class="sidebar">
    <!-- Sidebar mask for large tablets -->
    <div
      :style="{
        width: isMenuCollapsed ? null : '100vw',
        transition: isMenuCollapsed ? '0.3s all' : '0.01s all',
      }"
      :class="['sidebar-mask', isMenuCollapsed && 'hide', $arMediaQuery.window.maxWidth('sm') && 'window-sm-max']"
      @click="toggleNavbarVisibility"
    />

    <!-- Header area of sidebar, which will appear on mobiles and small tablets -->
    <div v-if="$arMediaQuery.window.maxWidth('sm')" class="sidebar__mobile-header">
      <div
        class="sidebar__mobile-header-content"
        v-ar-sticky-top="{
          priority: 10,
        }"
      >
        <ar-icon-button
          class="hamburger"
          size="large"
          :icon-props="{
            height: '16px',
            name: isMenuCollapsed ? 'filter' : 'cross',
          }"
          data-test-id="navbar-hamburger-button"
          @click="toggleNavbarVisibility"
        />
        <div class="logo-container">
          <ar-icon class="logo" name="ar-logo" width="25px" @click="handleLogoClick" data-test-id="sidebar-top-logo" />
        </div>
      </div>
    </div>

    <!-- Main panel of sidebar. Will slide out on mobile, and will be fixed positioned on large tablets/desktop -->
    <nav
      :class="[
        'sidebar-panel',
        isMenuCollapsed && 'sidebar-panel--collapsed',
        $arMediaQuery.window.maxWidth('xs') && 'window-xs-max',
        $arMediaQuery.window.only('sm') && 'window-sm',
      ]"
    >
      <a
        v-if="$arMediaQuery.window.minWidth('md')"
        class="logo-container"
        @click="handleLogoClick"
        data-test-id="sidebar-logo-link"
        v-tooltip.right="{
          content: dashboardEnabledForUser ? 'Dashboard' : null,
          offset: 5,
          delay: 1,
        }"
      >
        <ar-icon class="logo" name="ar-logo" width="35px" />
      </a>

      <ul
        :class="[
          'sidebar__nav',
          $arMediaQuery.window.maxWidth('xs') && 'window-xs-max',
          $arMediaQuery.window.maxWidth('sm') && 'window-sm-max',
        ]"
      >
        <li v-for="item in menu" :key="item.key">
          <a
            v-tooltip.right="{
              content: $arMediaQuery.window.minWidth('md') ? `${item.name}` : null,
              offset: 5,
              delay: 1,
            }"
            v-ar-feature-mask="{
              mode: 'transparent',
              show: !activationStateEnabled && !isFeatureEnabled(item.featureKeys),
              title: generateFeatureLockerTitle(item.name),
              message: generateFeatureLockerMessage(item.name),
            }"
            :aria-label="`${item.name}`"
            @click="handleSidebarLinkClick(item)"
            :class="[checkActiveResource(item.key) && 'active', `sidebar-item`]"
            :data-test-id="`sidebar-${item.key}-link`"
          >
            <ar-icon
              :name="item.iconName"
              :class="['icon', !activationStateEnabled && !isFeatureEnabled(item.featureKeys) && 'locked']"
            />
            <div class="sidebar-nav-text">
              {{ item.name }}
            </div>
          </a>
        </li>
      </ul>
      <div :class="['sidebar__profile', $arMediaQuery.window.maxWidth('sm') && 'window-sm-max']">
        <div class="u-display-flex pending-task-wrapper">
          <div class="u-margin-bottom-4 pending-task-icon-button-wrapper">
            <am2-icon-button-dropdown
              align="right"
              :icon-props="{
                name: 'refresh',
                width: '22px',
                height: '22px',
              }"
              :items="pendingTaskItems"
              :dropdown-style="{
                width: $arMediaQuery.window.minWidth('sm') ? '420px' : '300px',
              }"
              :dropdown-item-style="{
                height: '41px',
                padding: '0 20px',
              }"
              :class="{'rotation': isRunningTaskAnimation || formattedPendingTasks && formattedPendingTasks.length}"
              @select="handlePendingTaskItemSelect"
              @toggle="handlePendingTaskDropdownToggle"
              :data-test-id="`pending-task-sidebar-dropdown`"
            />
          </div>
          <ar-text
            v-if="$arMediaQuery.window.maxWidth('sm')"
            class="side-text"
            size="sm"
            :style="{
              height: '40px', // Overriding height of ar-text which can't be overrided by the class
            }"
            weight="bold"
            text="Currently running tasks"
          />
        </div>

        <div
          v-if="!!arEnableFreshdeskButton && !!arFreshdeskWidgetID && !!arFreshdeskWidgetUrl"
          class="u-margin-bottom-4"
          data-test-id="open-freshdesk-button-wrapper"
        >
          <am2-avatar-button
            data-test-id="open-freshdesk-button"
            @click="openFreshdesk"
            :avatar-props="{
              name: '?',
              textSize: 'md',
            }"
            :side-text="{
              text: $arMediaQuery.window.maxWidth('sm') ? 'Help' : null,
              style: {
                display: 'flex',
                alignItems: 'center',
                lineHeight: '40px',
                height: '40px',
                marginLeft: '10px',
                color: $arStyle.color.blueGrey700,
              },
            }"
            v-tooltip.right="{
              content: 'Help',
            }"
          />
        </div>

        <am2-avatar-button-dropdown
          align="right"
          :button-props="{
            sideText: sidebarNameText,
            avatarProps: {
              name: `${accountFirstName} ${accountLastName}`,
            },
            buttonProps: {
              customStyleAttributes: {
                maxWidth: '100%',
                overflow: 'hidden',
              },
            },
          }"
          :items="dropdown"
          :dropdown-style="{
            width: activationStateEnabled ? '275px' : '170px',
          }"
          @select="handleActionSelect"
          data-test-id="sidebar-profile-avatar"
        />
      </div>
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { generateFeatureLockerTitle, generateFeatureLockerMessage } from '@/utils/feature/';
import VueRouter from 'vue-router';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  name: 'Sidebar',
  data() {
    const menu = [
      {
        name: 'Campaigns',
        key: 'campaigns',
        path: 'campaigns',
        iconName: 'campaign-circles',
        featureKeys: ['campaigns'],
      },
      {
        name: 'Events',
        key: 'events',
        path: 'events',
        iconName: 'calendar',
        featureKeys: ['events'],
      },
      {
        name: 'Audience',
        key: 'audience',
        path: 'audience',
        iconName: 'audience',
        featureKeys: ['audience'],
      },
      {
        name: 'Insights',
        key: 'insights',
        path: 'insights',
        iconName: 'insights-graph',
        featureKeys: ['insights'],
      },
      {
        name: 'Messaging',
        key: 'message-center',
        path: 'message-center/messages',
        iconName: 'message-center',
        featureKeys: ['messages'],
      },
    ];

    return {
      menu,
      activationStateEnabled: process.env.arEnableActivationState,
      isMenuCollapsed: true,
      arEnableDashboard: process.env.arEnableDashboard,
      arEnableFreshdeskButton: process.env.arEnableFreshdeskButton,
      arFreshdeskWidgetID: process.env.arFreshdeskWidgetID,
      arFreshdeskWidgetUrl: process.env.arFreshdeskWidgetUrl,
      isRunningTaskAnimation: false,
    };
  },
  computed: {
    ...mapState({
      accountFirstName: (state) => (state.auth.account ? state.auth.account.firstName : null),
      accountLastName: (state) => (state.auth.account ? state.auth.account.lastName : null),
      accountEmailAddress: (state) => (state.auth.account ? state.auth.account.emailAddress : null),
      accountPromoterOid: (state) => (state.auth.account ? state.auth.account.promoterOid : null),
      pendingTasks: (state) => state.promoterTasks.pendingTasks,
    }),
    ...mapGetters({
      isFeatureEnabled: 'auth/isFeatureEnabled',
      isAdminAccount: 'auth/isAdminAccount',
      formattedPendingTasks: 'promoterTasks/formattedTasks',
      formattedCompletedTasks: 'promoterTasks/formattedCompletedTasks',
    }),
    dashboardEnabledForUser() {
      if (!this.arEnableDashboard) return false;
      if (!this.accountEmailAddress) return false;
      if (this.accountEmailAddress.includes('@arep.co')) return true;
      if (this.accountEmailAddress.includes('@audiencerepublic.com')) return true;
      if ([104].indexOf(this.accountPromoterOid) > -1) return true;
      return false;
    },
    sidebarNameText() {
      if (this.$arMediaQuery.window.minWidth('md')) return null;
      let sideTextObject = {
        style: {
          color: this.$arStyle.color.blueGrey700,
          display: 'flex',
          height: '40px',
          alignItems: 'center',
          paddingLeft: '10px',
        },
      };
      if (this.$arMediaQuery.window.only('sm')) sideTextObject.text = this.accountFirstName;
      if (this.$arMediaQuery.window.only('xs'))
        sideTextObject.text = `${this.accountFirstName} ${this.accountLastName}`;
      return sideTextObject;
    },
    dropdown() {
      if (this.isAdminAccount) {
        return [
          {
            name: `${this.accountFirstName} ${this.accountLastName}`.toUpperCase(),
            type: 'header',
          },
          {
            name: 'Promoter Permissions',
            action: () => this.navigateTo('/admin/permissions'),
          },
          {
            type: 'divider',
          },
          {
            name: 'Log Out',
            action: this.performLogout,
          },
        ];
      } else {
        let items = [];
        items = items.concat([
          {
            avatar: null,
            firstName: this.accountFirstName,
            lastName: this.accountLastName,
            emailAddress: this.accountEmailAddress,
            type: 'profile',
          },
          {
            type: 'divider',
          },
          {
            icon: {
              name: 'settings',
            },
            name: 'Account settings',
            action: () => this.navigateTo('/settings/subscriptions'),
          },
        ]);
        if (process.env.arEnableAutomation) {
          items.push({
            icon: {
              name: 'sync',
            },
            name: 'Automation',
            action: () => this.navigateTo('/automation'),
          });
        }
        if (process.env.arEnablePrivacyPortal) {
          items.push({
            icon: {
              name: 'privacy',
            },
            name: 'Privacy Portal',
            action: () => this.navigateTo('/privacy-portal'),
          });
        }
        items = items.concat([
          {
            type: 'divider',
          },
          {
            icon: {
              name: 'sign-out',
            },
            name: 'Sign Out',
            action: this.performLogout,
          },
        ]);
        return items;
      }
    },

    pendingTaskItems() {
      const items = [];
      let prettyName = 'Currently running tasks';
      if (this.formattedPendingTasks && this.formattedPendingTasks.length > 0) {
        prettyName = `${prettyName} (${this.formattedPendingTasks.length})`;
      }
      items.push({
        name: prettyName,
        key: null,
        type: 'header',
        hasCloseIcon: true,
      });

      if (!this.formattedPendingTasks || this.formattedPendingTasks.length === 0) {
        items.push({
          name: `No tasks running`,
          type: 'default-without-hover',
          key: null,
        });
      }

      this.formattedPendingTasks.forEach((pendingTask) => {
        const subtitleString = pendingTask.subtitle ? `${pendingTask.subtitle}` : '';
        const startedString = pendingTask.started ? `- ${pendingTask.started}` : '';
        items.push({
          icon: {
            name: pendingTask.icon,
          },
          name: `${pendingTask.name}`,
          //subtitle and started to name to make it two lines and easy to read
          subtitleStartedString: `${subtitleString} ${startedString}`,
          action: pendingTask.clickthrough ? () => this.navigateTo(pendingTask.clickthrough) : null,
        });
      });

      // Completed Tasks

      if (this.formattedCompletedTasks && this.formattedCompletedTasks.length > 0) {
        items.push({
          name: `Recently completed tasks (${this.formattedCompletedTasks.length})`,
          key: null,
          type: 'header',
        });

        this.formattedCompletedTasks.forEach((pendingTask) => {
          const subtitleString = pendingTask.subtitle ? `${pendingTask.subtitle}` : '';
          const startedString = pendingTask.started ? `- ${pendingTask.started}` : '';
          items.push({
            icon: {
              name: pendingTask.icon,
            },
            name: `${pendingTask.name}`,
            // subtitle and started to name to make it two lines and easy to read
            subtitleStartedString: `${subtitleString} ${startedString}`,
            action: pendingTask.clickthrough ? () => this.navigateTo(pendingTask.clickthrough) : null,
          });
        });
      }

      return items;
    },
  },
  watch: {
    formattedCompletedTasks(newTasks, oldTasks) {
      if (newTasks.length !== 0 && oldTasks.length !== 0 && newTasks[0].startTime !== oldTasks[0].startTime) {
        this.isRunningTaskAnimation = true;
        setTimeout(() => {
          this.isRunningTaskAnimation = false;
        }, 6000);
      }
    }
  },
  mounted() {
    this.checkBackgroundTasks();
  },
  methods: {
    ...mapActions(['auth/LOGOUT', 'promoterTasks/START_POLLING_PENDING_TASKS', 'promoterTasks/GET_COMPLETED_TASKS']),

    checkActiveResource(key) {
      return this.$route.path.indexOf(`/${key}`) === 0;
    },

    generateFeatureLockerTitle(featureName) {
      return generateFeatureLockerTitle(featureName);
    },

    generateFeatureLockerMessage(featureName) {
      return generateFeatureLockerMessage(featureName);
    },

    navigateTo(path) {
      this.isMenuCollapsed = true;
      this.$router.push({ path }).catch((failure) => {
        if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
          // clicking a menu item when you're already in that section will refresh the page
          this.$router.go(0);
        }
      });
    },

    performLogout() {
      this['auth/LOGOUT']();
    },

    handleActionSelect(item) {
      if (item.action) {
        item.action();
      }
    },

    toggleNavbarVisibility() {
      this.isMenuCollapsed = this.$arMediaQuery.window.minWidth('md') ? false : !this.isMenuCollapsed;
    },

    async handleSidebarLinkClick(item) {
      this.navigateTo(`/${item.path}`);
    },

    async handleLogoClick() {
      if (this.dashboardEnabledForUser) {
        this.navigateTo(`/dashboard`);
      } else {
        this.navigateTo(`/campaigns`);
      }
    },

    checkRunningTasks() {
      this['promoterTasks/START_POLLING_PENDING_TASKS']({});
    },

    checkCompletedTasks() {
      this['promoterTasks/GET_COMPLETED_TASKS']({});
    },

    checkBackgroundTasks() {
      this.checkRunningTasks();
      this.checkCompletedTasks();
    },

    handlePendingTaskItemSelect(item) {
      if (!!item.action) {
        item.action();
      }
    },

    openFreshdesk() {
      if (!window.FreshworksWidget || window.FreshworksWidget === undefined || window.FreshworksWidget === null) {
        console.error('Freshworks is not initialised');
        return null;
      }

      FreshworksWidget('open');
    },

    handlePendingTaskDropdownToggle(isOpen) {
      if (isOpen && this.formattedPendingTasks.length === 0) this.isRunningTaskAnimation = false;
    }
  },
};
</script>

<style lang="scss" scoped>
$sm-sidebar-width: 255px;

.sidebar {
  .sidebar__mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: $zIndexGlobalRegular;

    .sidebar__mobile-header-content {
      height: $sidebar_header_height;
      width: 100vw;
      background-color: #fff;
      border-bottom: 1px solid $blueGrey500;
      padding: 0 20px;
      .hamburger {
        display: flex;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }

      .logo-container {
        position: absolute;
        top: 0;
        right: 20px;
        .logo {
          height: $sidebar_header_height;
          margin: 0;
          display: flex;
          width: auto;
          cursor: pointer;
        }
      }
    }
  }

  .sidebar-panel {
    display: flex;
    flex-direction: column;
    background: #fff;
    height: 100%;
    left: 0;
    margin-left: 0px;
    overflow: visible;
    position: fixed;
    top: 0;
    width: 80px;
    z-index: $zIndexGlobalHigh;
    border-right: 1px solid $skyBlueGrey500;

    &.window-sm {
      transition: left 0.2s;
      width: $sm-sidebar-width;
      top: $sidebar_header_height;
      height: calc(100vh - #{$sidebar_header_height});
    }

    &.window-xs-max {
      transition: left 0.2s;
      width: 100vw;
      position: fixed;
      top: $sidebar_header_height;
      height: calc(100vh - #{$sidebar_header_height});
    }

    &.sidebar-panel--collapsed {
      &.window-xs-max {
        left: -100vw;
      }
      &.window-sm {
        left: -$sm-sidebar-width;
      }
    }
  }

  &-mask {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: $zIndexHighest;
    background: rgba(31, 40, 68, 0.6);
    transform: translateX(0);
    cursor: pointer;

    &.window-sm-max {
      display: block;
    }

    &.hide {
      transform: translateX(-100%);
    }
  }

  .logo {
    display: block;
    margin: 24px auto 19px;
    width: 35px;
    padding: 0;
    cursor: pointer;
  }

  .sidebar__profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    position: absolute;
    bottom: 32px;
    left: 0;
    width: 100%;
    cursor: default;

    &.window-sm-max {
      justify-content: flex-start;
      align-items: flex-start;
    }

    .pending-task-wrapper {
      .pending-task-icon-button-wrapper {
        padding: 3px;
        border: 1px solid #dcdee4;
        border-radius: 20px;
        box-shadow: 2px 0 5px #e4e5e7;
      }

      .side-text {
        display: flex;
        align-items: center;
        line-height: 40px;
        height: 40px;
        margin-left: 10px;
        color: $blueGrey700;
      }
    }
  }

  .sidebar__nav {
    margin: 0;
    padding: 0;
    list-style: none;
    height: 100%;
    position: relative;
    margin-bottom: 10px;

    &.window-sm-max {
      margin-bottom: 100px;
    }

    li {
      height: 80px;
      position: relative;
      cursor: pointer;

      .sidebar-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: $blueGrey700;

        &:hover,
        &:focus {
          color: $purple500;
          background-color: $purple100;
        }

        &.active {
          color: $purple500;
        }

        .icon {
          display: inline-flex;
          align-self: center;

          &.locked {
            color: $skyBlueGrey600;
          }
        }
        .avatar-dropdown {
          max-width: 100%;
          overflow: hidden;
        }
      }
    }

    .sidebar-nav-text {
      display: none;
    }

    &.window-sm-max {
      li {
        height: 60px;
        .sidebar-item {
          padding-left: 12px;
          justify-content: flex-start;
          .ar-icon-wrapper {
            padding-right: 12px;
            min-width: 44px;
            text-align: center;
          }
          .icon {
            height: 30px;
            display: inline-flex;
            align-content: center;
            justify-content: center;
          }
        }
      }
      .sidebar-nav-text {
        line-height: 30px;
        display: inline-block;
        font-weight: bold;
      }
    }
    &.window-xs-max {
      li {
        height: 50px;
        .sidebar-item {
          padding-left: 12px;
        }
      }
    }
  }
}

.rotation {
  animation: rotator 3s infinite linear;
}
@keyframes rotator {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
