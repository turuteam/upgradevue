const applicationPlugin = (store: any) => {
  setInterval(function () {
    store.commit('application/SET_APPLICATION_TIME', new Date().getTime());
  }, 1000);
};

export default applicationPlugin;
