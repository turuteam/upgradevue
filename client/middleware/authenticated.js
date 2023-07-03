
export default async ({ store, route, redirect }) => {
  // RK/NOTE/29-07-2019
  //
  // For now, any routes that do not require authentication need to
  // be hard-coded here because the default Layout automatically
  // attempts authentication and redirects to login page on failure.
  // TODO later: draft a simpler way to differentiate authenticated
  // pages with unauthenticated pages.
  //
  // The other issue is that for routes that don't need authentication
  // seem to be created/mounted twice. Not sure why this is the case,
  // it may be vuex recreating components based on a dispatch
  if (store.getters['auth/userPromoterOid'] === null && !window.sessionStorage.getItem('x-auth-token')) {
    if (
      route.path !== '/authenticate/login'
      && route.path !== '/authenticate/masquerade-login'
      && route.path !== '/authenticate/signup'
      && route.path !== '/authenticate/forgot-password'
      && route.path !== '/authenticate/reset-password'
      && route.path !== '/authenticate/email-verify'
      && route.path !== '/maintenance'
    ) {
      redirect('/authenticate/login');
      return;
    }
  } else if (store.getters['auth/userPromoterOid'] === null && window.sessionStorage.getItem('x-auth-token')) {
    // If there is no promoter account then we need to populate it, otherwise don't.
    // Check for promoter account? if we don't have one then do the request.
    await store.dispatch('auth/VERIFY_TOKEN');
  } else {
    // Do nothing if promoter oid exists
  }
};
