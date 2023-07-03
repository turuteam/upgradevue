import { hubspotWhitelistPaths } from '@/utils/route';

export default ({ app }) => {

  const injectHubspotScripts = () => {
    const script = document.createElement('script');
    script.onload = function () {
      // If necessary
    };
    script.src = process.env.arHubspotScriptsUrl;
    document.head.appendChild(script);
  };

  let hasInitializedHubspot = false;

  app.router.afterEach((to) => {
    if (!to) {
      return;
    }
    // We only track limte of pages in AM2 for now, will probably remove it if we do want to track everything
    if (hubspotWhitelistPaths.indexOf(to.path) === -1) {
      return;
    }

    // Always do it, referring to Hubspot Document
    window._hsq = window._hsq || [];

    if (!hasInitializedHubspot) { // If you haven't initialized Hubspot, let's do initialization
      hasInitializedHubspot = true;
      window._hsq.push(['setPath', to.fullPath]); // Do not forget to set first path
      injectHubspotScripts();
    } else { // Oh good, you already initialized Hubspot, let's just track path
      window._hsq.push(['setPath', to.fullPath]);
      window._hsq.push(['trackPageView']);
    }
  })
}
