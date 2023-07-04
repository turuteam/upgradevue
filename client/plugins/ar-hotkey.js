import { defineNuxtPlugin } from 'nuxt/app';

const keydownListener = function(e) {
  if (this.hotkeyDisabled) {
    return;
  }
  if (!this.expectedKeys || !Array.isArray(this.expectedKeys)) {
    return;
  }
  const expectedKeys = this.expectedKeys;
  let pressedKeys = [];
  if (e.ctrlKey) {
    pressedKeys.push('Control');
  }
  if (e.metaKey) {
    pressedKeys.push('Meta');
  }

  if (e.key !== 'Control' && e.key !== 'Meta') {
    pressedKeys.push(e.key);
  }

  // If number of keys not matches
  if (expectedKeys.length !== pressedKeys.length) {
    return;
  }

  // Make sure all keys match
  for (let i = 0; i < expectedKeys.length; i += 1) {
    if (pressedKeys.indexOf(expectedKeys[i]) === -1) {
      return;
    }
  }

  this.hotkeyAction();
};

const isMac = function () {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

/**
 * I'm struggling with proper way to test this kind of file, so I rather not waste too much time here.
 * But I will comeback and finish the unit test for this.
 * Messi Yang.
 */
const ARHotkey = {
  install: (app) => {
    app.directive('ar-hotkey', {
      bind: function (el, binding, vnode) {
        const {
          disabled,
          action,
          general,
          mac,
        } = binding.value;
        el.hotkeyDisabled = disabled;
        el.hotkeyAction = action;
        el.expectedKeys = isMac() ? mac : general;
        el.vnode = vnode;
        // Always remember to bind DOM
        el.keydownListener = keydownListener.bind(el);
        window.addEventListener('keydown', el.keydownListener);
      },
      // You might update hotkey
      update: function (el, binding) {
        const {
          disabled,
          action,
          general,
          mac,
        } = binding.value;
        el.hotkeyDisabled = disabled;
        el.hotkeyAction = action;
        el.expectedKeys = isMac() ? mac : general;
      },
      unbind: function (el) {
        window.removeEventListener('keydown', el.keydownListener);
      },
    });
  },
};

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(ARHotkey)
});
