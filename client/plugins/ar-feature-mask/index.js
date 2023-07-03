import Vue from 'vue';
import FeatureMaskComponent from './FeatureMask';

const updateInstanceProps = (instance, {
  mode = 'default',
  show = null,
  showUpgradeOn = 'hover',
  iconName = null,
  title = null,
  message = null,
  margin = {},
}) => {
  instance.mode = mode;
  instance.show = show;
  instance.showUpgradeOn = showUpgradeOn,
  instance.iconName = iconName;
  instance.title = title;
  instance.message = message;
  instance.margin = {
    top: `${margin.top || 0}px`,
    right: `${margin.right || 0}px`,
    bottom: `${margin.bottom || 0}px`,
    left: `${margin.left || 0}px`,
  };
};

export const createFeatureMaskInstance = ({ values, $store, $router }) => {
  const instance = new Vue(FeatureMaskComponent);
  instance.injectDependencies({
    $store,
    $router,
  });
  instance.$mount();

  updateInstanceProps(instance, values);

  return instance;
};

export const updateFeatureMaskInstance = ({ instance, values }) => {
  updateInstanceProps(instance, values);
};

export const destroyFeatureMaskInstance = ({ instance }) => {
  instance.$destroy();
};

const ARFeatureLocker = {
  install: (app) => {
    app.directive('ar-feature-mask', {
      inserted: (el, binding, vnode) => {
        if (!el.style.position) {
          el.style.position = 'relative';
        }
        el.featureLockerInstance = createFeatureMaskInstance({
          values: binding.value,
          $store: vnode.context.$store,
          $router: vnode.context.$router,
        });
        el.appendChild(el.featureLockerInstance.$el);
      },
      update: (el, binding) => {
        updateFeatureMaskInstance({
          instance: el.featureLockerInstance,
          values: binding.value,
        });
      },
      unbind: (el) => {
        destroyFeatureMaskInstance({
          instance: el.featureLockerInstance,
        });
      },
    });
  },
};

export default ARFeatureLocker;

Vue.use(ARFeatureLocker);
