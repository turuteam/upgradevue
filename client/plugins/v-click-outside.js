import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.directive('click-outside', {
    bind: function (el, binding, vnode) {
      el.clickOutsideEvent = function (event) {
        // check the click was outside the el and it's children
        if (!(el == event.target || el.contains(event.target))) {
          
          // if so, call method provided in attribute value
          vnode.context[binding.expression](event);
        }
      };
      document.body.addEventListener('mouseup', el.clickOutsideEvent)
    },
    unbind: function (el) {
      document.body.removeEventListener('click', el.clickOutsideEvent)
    },
  })
})