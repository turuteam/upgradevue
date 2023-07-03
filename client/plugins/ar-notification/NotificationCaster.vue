<template>
  <section class="global-notification">
    <ar-snackbar
      v-for="(notification, idx) of notifications"
      :key="notification.stamp"
      ref="notification-card"
      :type="notification.type"
      :message="generateNotificationMessage(notification)"
      has-clear-icon
      @anchorClick="handleLinkClick(notification.stamp)"
      @clear="handleClearClick(notification.stamp)"
      :style="{
        zIndex: notifications.length - idx,
        marginTop: notification.marginTop || '0',
        opacity: notification.opacity || '1',
        marginBottom: '10px',
      }"
    />
  </section>
</template>

<script>
export default {
  name: 'GlobalNotification',
  data() {
    return {
      notifications: [],
      isShow: false,
      iconNameMap: {
        success: 'notification-success',
        error: 'notification-error',
        warning: 'notification-warning',
        general: 'notification-general',
      },
      finishedPushMap: {},
    };
  },
  created() {
    window.addEventListener('arNotificationPush', this.notificationPushEventPasser);
  },
  beforeDestroy() {
    window.removeEventListener('arNotificationPush', this.notificationPushEventPasser);
  },
  methods: {
    generateNotificationMessage(notification) {
      if (notification.link) {
        return `${notification.message} <a>${notification.link}</a>`;
      } else {
        return notification.message;
      }
    },
    getNotificationByStamp(stamp) {
      const index = this.notifications.findIndex(notification => notification.stamp === stamp);
      return { notification: this.notifications[index], index,};
    },
    initializeNotificationStyleByStamp(stamp) {
      const { notification, index } = this.getNotificationByStamp(stamp);
      this.$set(this.notifications, index, { ...notification, marginTop: '0', opacity: '1' });
    },
    triggerReceiveEvent(stamp, answer) {
      // It's already triggered
      if (this.finishedPushMap[stamp]) {
        return;
      }
      this.$set(this.finishedPushMap, stamp, true);

      // Trigger "arNotificationReceive" event, so our plugin can receive it
      const customEvent = new CustomEvent(
        'arNotificationReceive',
        {
          detail: {
            answer,
            hash: stamp,
          }
        },
      );
      window.dispatchEvent(customEvent);
    },
    fadeOutNotificationByStamp(stamp) {
      const { notification, index } = this.getNotificationByStamp(stamp);
      if (index === -1) {
        return;
      }
      this.$set(
        this.notifications,
        index,
        {
          ...notification,
          opacity: '0',
          marginTop: `-${this.$refs['notification-card'][0].$el.clientHeight + 10}px`,
        },
      );

      window.setTimeout(() => {
        this.removeNotificationByStamp(stamp);
      }, 300);
    },
    // Remove notfication
    removeNotificationByStamp(stamp) {
      // Trigger recieve event with answer as false
      this.triggerReceiveEvent(stamp, false);
      this.notifications = this.notifications.filter(notification => notification.stamp !== stamp);
    },
    notificationPushEventPasser(event) {
      this.handleNotificationPush(event.detail.payload, event.detail.hash);
    },
    // This will close notificaiton before the timeout
    handleLinkClick(stamp) {
      this.fadeOutNotificationByStamp(stamp);
      // Sometimes we need to know if promoter clicked link, if yes, answer is true
      this.triggerReceiveEvent(stamp, true);
    },
    handleClearClick(stamp) {
      this.fadeOutNotificationByStamp(stamp);
      this.triggerReceiveEvent(stamp, false);
    },
    handleNotificationPush({ type, message, link, width, timeout }, hash) {

      // Defaults: Success timeout is 6 sec. All others are 8.5 sec
      let finalTimeout = type === 'success' ? 6000 : 8500;
      if (timeout) {
        finalTimeout = timeout;
      }

      // Skip creating the notification if it's already visible on the page.
      // This happens when a component inadvertently sends a message twice.
      const alreadyShown = this.notifications.some(n => {
        return message === n.message &&
                type === n.type &&
                link === n.link
      });

      if (alreadyShown) {
        return;
      }

      const stamp = hash;
      const newNotification = { stamp, type, message, link, stamp, opacity: '0', marginTop: '-30px', width };
      this.isShow = true;
      this.notifications = [
        ...this.notifications,
        newNotification,
      ];

      // Change the initial opacity and marginTop to normal
      window.setTimeout(() => { this.initializeNotificationStyleByStamp(stamp) }, 100);

      window.setTimeout(() => {
        this.fadeOutNotificationByStamp(stamp);
      }, finalTimeout);
    },
  },
};
</script>

<style lang="scss" scoped>
.global-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: flex-end;
  flex-direction: column;
  transition: 0.3s all;
  z-index: $zIndexGlobalHighest + 1;
}
</style>
