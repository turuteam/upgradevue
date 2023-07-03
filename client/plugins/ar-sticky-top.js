import Vue from 'vue';
import { debounce } from 'debounce';
import { mergeObjects } from '@/utils/helpers/';

window._arStickyTopItems = [];

const normalizeMeta = function (value) {
  return mergeObjects({
    disabled: false,
    priority: 1,
    gap: 0,
  }, value || {});
};

const addElement = function (element, meta) {
  window._arStickyTopItems.push({
    element,
    meta,
  });
  window._arStickyTopItems.sort((itemA, itemB) => {
    if (itemA.meta.priority > itemB.meta.priority) {
      return -1;
    } else if (itemA.meta.priority < itemB.meta.priority) {
      return 1;
    } else {
      return 0;
    }
  });
};

const updateElementMeta = function (element, meta) {
  const elementIndex =
    window._arStickyTopItems.findIndex(stickyTopItem => {
      return stickyTopItem.element === element
    });
    window._arStickyTopItems[elementIndex].meta = meta;
};

const removeElement = function (element) {
  const elementIndex =
    window._arStickyTopItems.findIndex(stickyTopItem => {
      return stickyTopItem.element === element
    });
  window._arStickyTopItems.splice(elementIndex, 1);
};

const calculateStickyElementsHeight = function () {
  return window._arStickyTopItems
      .reduce((preVal, stickyTopItem) => {
        if (stickyTopItem.meta.disabled) { return preVal };
        return preVal + stickyTopItem.element.offsetHeight + stickyTopItem.meta.gap;
      }, 0);
};

const calculateElementStickyTop = function (element) {
  const elementIndex =
    window._arStickyTopItems.findIndex(stickyTopItem => {
      return stickyTopItem.element === element
    });
  return window._arStickyTopItems
      .slice(0, elementIndex)
      .reduce((preVal, stickyTopItem) => {
        if (stickyTopItem.meta.disabled) { return preVal };
        return preVal + stickyTopItem.element.offsetHeight + stickyTopItem.meta.gap;
      }, 0);
};

const stickElements = function () {
  window._arStickyTopItems.forEach((stickyTopItem, index) => {
    if (stickyTopItem.meta.disabled) { return; }
    stickyTopItem.element.style.position = 'sticky';
    stickyTopItem.element.style.top = `${calculateElementStickyTop(stickyTopItem.element) + stickyTopItem.meta.gap}px`;
    stickyTopItem.element.style.zIndex = window._arStickyTopItems.length - index + 10;

    window.dispatchEvent(new CustomEvent('arStickyTopInfoUpdate', {
      detail: {
        totalStickyElementsHeight: calculateStickyElementsHeight(),
      }
    }))
  });
};

// We set third argument "immediate" as "true", coz in the case
// we want it to be executed immediately and we don't want it to be
// triggered multiple times in a sort period
const debounceStickElements = debounce(stickElements, 100, true);

const ARStickyTop = {
  install: (app) => {
    app.directive('ar-sticky-top', {
      inserted: (el, binding) => {
        addElement(el, normalizeMeta(binding.value));
        stickElements();
      },
      update: (el, binding) => {
        updateElementMeta(el, normalizeMeta(binding.value));
      },
      unbind: (el) => {
        removeElement(el);
        stickElements();
      },
    });

    // Update all elements sticky top when resize
    window.addEventListener('resize', function () {
      debounceStickElements();
    });
    // Update all elements sticky top when scroll
    window.addEventListener('scroll', function () {
      debounceStickElements();
    });

    app.mixin({
      created() {
        this._arStickyTop = {
          totalStickyElementsHeight: 0,
        };

        window.addEventListener('arStickyTopInfoUpdate', (event) => {
          this._arStickyTop = event.detail;
        });

        // Do not take this out, otherwise update on our $arMediaQuery won't trigger vDOM rerendering
        app.util.defineReactive(this, '_arStickyTop', this.$arStickyTop);
      },
    });

    // $arStickyTop tools
    Object.defineProperty(app.prototype, '$arStickyTop', {
      get() {
        return this.$root._arStickyTop;
      },
      set(newVal) {
        return this.$root._arStickyTop = newVal;
      }
    });
  },
};

export default ARStickyTop;

Vue.use(ARStickyTop);
