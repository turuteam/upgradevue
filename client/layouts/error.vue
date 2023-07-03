<template>
  <div class="warning-modal-body">
    <div class="exclamation-mark">
      <ar-icon
        name="alert-exclamation-mark"
        height="70px"
      />
    </div>
    <ar-text
      class="error-message"
      multiple-lines
      :text="error.message"
      align="center"
      size="md"
    />
    <section
      class="advice-message"
    >
      <ar-text
        :text="adviceMsg"
        allow-html
        multiple-lines
        align="center"
        size="sm"
      />
    </section>
  </div>
</template>

<script>
export default defineNuxtComponent({
  name: 'ErrorPage',
  layout: 'default',

  props: {
    error: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      adviceMsg: 'Uh-oh, something went wrong!<br/>Please try again later or <a href="javascript:window.location.href=window.location.href">refresh the page</a>',
    };
  },

  methods: {
    handleReloadPageClick() {
      window.location.reload();
    },
  },
});
</script>

<style lang="scss" scoped>
.warning-modal-body {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 250px;
  padding: 20px;
  .exclamation-mark {
    display: flex;
    justify-content: center;
    margin-bottom: 19px;
  }
  .error-message {
    margin-bottom: 16px;
  }
  .advice-message {
    display: flex;
    align-items: center;
  }
}
</style>
