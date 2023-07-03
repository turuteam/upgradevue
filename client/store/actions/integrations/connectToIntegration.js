/**
 * CONNECT_TO_INTEGRATION
 * Connecting the promoter to a new integration
 *
 * @param { Object } payload
 * @param { string } payload.name - Integration name (e.g: 'Facebook')
 * @param { string } payload.provider - Integration's provider, (e.g: 'facebook')
 * @param { ? } payload.integration
 * @fires POPUP_CENTER - Open the new popup window
 * @returns { function } form.submit
 */
export async function CONNECT_TO_INTEGRATION(
  {},
  { app, provider, additionalInfo }
) {
  const apiDomain = process.env.arAudienceManagerApiDomain;

  let actionUrl = `${apiDomain}/api/v1/sg/oauth?provider=${provider}&app=${app}`;

  if (!!additionalInfo) {
    let encodedString = null;
    try {
      encodedString = encodeURIComponent(JSON.stringify(additionalInfo));
    } catch(e) {
      console.error(e);
      encodedString = encodeURIComponent(JSON.stringify({}));
    }
    actionUrl = `${actionUrl}&additionalInfo=${encodedString}`
  }

  // Specify form actions, target & specific elements
  const form = document.createElement('form');
  form.action = actionUrl;
  form.target = provider;
  form.method = 'post';
  form.display = 'none';

  const oauthActionInput = document.createElement('input');
  oauthActionInput.type = 'hidden';
  oauthActionInput.name = 'oauth-action';
  oauthActionInput.value = JSON.stringify({ action: 'integrate',});

  // const proxyRedirectUrlInput = document.createElement('input');
  // proxyRedirectUrlInput.type = 'hidden';
  // proxyRedirectUrlInput.name = 'proxy-redirect-url';
  // proxyRedirectUrlInput.value = JSON.stringify(proxyRedirectUrl);

  const bounceToDomainInput = document.createElement('input');
  bounceToDomainInput.type = 'hidden';
  bounceToDomainInput.name = 'bounce-to-domain';
  bounceToDomainInput.value = JSON.stringify(apiDomain);

  const xAuthTokenInput = document.createElement('input');
  xAuthTokenInput.type = 'hidden';
  xAuthTokenInput.name = 'security';
  xAuthTokenInput.value = JSON.stringify({ 'x-auth-token': window.sessionStorage.getItem('x-auth-token')});

  form.appendChild(oauthActionInput);
  // form.appendChild(proxyRedirectUrlInput);
  form.appendChild(bounceToDomainInput);
  form.appendChild(xAuthTokenInput);
  document.body.appendChild(form);

  const oauthPopup = popupCenter(
    actionUrl,
    provider,
    600,
    700,
  );

  form.submit();
  document.body.removeChild(form);

  return new Promise((resolve, reject) => {
    // Keep tracking if the user close the popup
    this.listenToPopupClose = setInterval(() => {
      if (oauthPopup.closed) {
        const userCloseError = new Error('Popup closed by user')
        userCloseError.name = 'USER_CLOSE';
        reject(userCloseError);

        // Remove all listener
        clearInterval(this.listenToPopupClose);
        window.removeEventListener('message', handleOauthCallback);
        this.routeHooker(); // Also remember to close route change hooker
      }
    }, 500);
    const handleOauthCallback = (result) => {
      // If it's from different domain
      if (result.origin !== apiDomain) {
        return;
      }
      // Remove all listener
      clearInterval(this.listenToPopupClose);
      window.removeEventListener('message', handleOauthCallback);
      this.routeHooker(); // Also remember to close route change hooker

      const resJson = JSON.parse(result.data);

      // If there's not integration-oid returned
      if (resJson['error-description']) {
        reject(new Error(resJson['error-description']));
        return;
      } else if (!resJson['integration-oid']) {
        const noIntegrationOidError = new Error('No integrationOid returned');
        noIntegrationOidError.name = 'NO_INTEGRATION_OID';
        reject(noIntegrationOidError);
        return;
      }
      resolve();
    }
    window.addEventListener('message', handleOauthCallback);

    // Get the hooker for deletion
    this.routeHooker = this.app.router.beforeEach((to, from, next) => {
      oauthPopup.close();

      // Close hooker
      this.routeHooker();
      next();
    });
  });
}

function popupCenter(url, title, w, h) {
  // Fixes dual-screen position                         Most browsers      Firefox
  var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  var left = width / 2 - w / 2 + dualScreenLeft;
  var top = height / 2 - h / 2 + dualScreenTop;
  var oauthPopup = window.open(
    url,
    title,
    'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left
  );

  // Puts focus on the oauthPopup
  if (window.focus) {
    oauthPopup.focus();
  }
  return oauthPopup;
}
