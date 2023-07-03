import dayjs from 'dayjs'

export default ({ app, store }) => {
  const initializePendo = (account) => {
    // Please use Strings, Numbers, or Bools for value types.
    let pendoParams = {
      visitor: {
        id: account.oid, // Required if user is logged in
        email: account.emailAddress,
        firstName: account.firstName,
        lastName: account.lastName,
        full_name: `${account.firstName} ${account.lastName}`,
        role: account.role ? account.role.map((role) => {
          return role
        }) : null,
        companyCategory: account.companyCategory,
        creationDate: !!account.sysCtime ? dayjs(account.sysCtime).toISOString() : null,
        country: account.country,
      },

      account: {
        id: account.promoterOid,
        companyName: account.companyName,
        companyCategory: account.companyCategory,
        companyCreationDate: !!account.companySysCtime ? dayjs(account.companySysCtime).toISOString() : null,
      }
    }

    /*
     * A.R. 2022-06-21: Mapping Feature Object into boolean fields
     * ----------------------------
     * 'feature' is a field in auth.account that contains an object of features that an account may have enabled
     * Example structure is
     *   feature: { featureKey: { id: 'feature-key', oid: 111, enabled: true, components: { componentKey: { id: 'component-key', oid: 122, enabled: false } } } }
     * Features may have 'components' inside them with the same structure of 'id', 'oid', and 'enabled'.
     * Since Pendo does not accept Objects, we have to map them out to single booleans.
     */
    if (!!account.features) {
      const featureKeys = Object.keys(account.features)
  
      if (!!featureKeys && featureKeys.length > 0) {
        featureKeys.forEach((feature) => {
          const featureContent = account.features[feature]
          const feature_label = `is_feature_${featureContent.id}_enabled`
          pendoParams.account[feature_label] = featureContent.enabled
  
          if (!!featureContent.components) {
            const featureComponentKeys = Object.keys(featureContent.components)
  
            if (!!featureComponentKeys && featureComponentKeys.length > 0) {
              featureComponentKeys.forEach((featureComponent) => {
                const featureComponentContent = account.features[feature].components[featureComponent]
                const feature_component_label = `is_feature_${feature}_${featureComponentContent.id}_enabled`
                pendoParams.account[feature_component_label] = featureComponentContent.enabled
              })
            }
          }
        })
      }
    }

    if (typeof pendo === 'undefined' || !pendo.validateInstall) {
      // Pendo injection script
        (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
        v=['initialize','identify','updateOptions','pageLoad','track'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.src=`https://cdn.pendo.io/agent/static/${process.env.arPendoAPIKey}/pendo.js`;
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);}
      )(window,document,'script','pendo');
      // Pendo has not been initialized yet
      // Call this function after users are authenticated in your app and your visitor and account id values are available
      pendo.initialize(pendoParams);
    } else {
      // Pendo has been previously initialized and the data has to be updated.
      // This is necessary if the user accesses multiple accounts in the same browser.
      pendo.identify(pendoParams);
    }
  }

  /*
  ** Every time the route changes (fired on initialization too)
  */
  app.router.afterEach(() => {
    const {
      auth
    } = store._modules.root.state

    // An account must be logged in for Pendo to be initialized/indentified.
    if (!auth || !auth.account || !process.env.arPendoAPIKey) { return; }

    initializePendo(auth.account);
  })
}