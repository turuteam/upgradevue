export default ({ app, store }) => {
    if (!process.env.arFreshdeskWidgetUrl || !process.env.arFreshdeskWidgetID) return;

    let isInitialized = false;
    
    const initializeFreshdesk = () => {
      window.fwSettings = {
        'widget_id': process.env.arFreshdeskWidgetID
      };
      !function(){if("function"!=typeof window.FreshworksWidget){var n=function(){n.q.push(arguments)};n.q=[],window.FreshworksWidget=n}}()

      // Load async deferred script
      const script = document.createElement('script');
      script.onload = function () {
        // If necessary
      };
      script.src = process.env.arFreshdeskWidgetUrl;
      script.async = true
      script.defer = true
      document.head.appendChild(script);
    }
  
    /*
    ** Every time the route changes (fired on initialization too)
    */
    app.router.afterEach(() => {
      const {
        auth
      } = store._modules.root.state

      // An account must be logged in for Freshdesk to be prefilled and initialised.
      if (!auth || !auth.account) {
        return;
      }

      if (!isInitialized || window.FreshworksWidget === undefined || window.FreshworksWidget === null) {
        initializeFreshdesk();
        isInitialized = true;
        FreshworksWidget('hide', 'launcher');
      }

      // Prefill FreshDesk
      FreshworksWidget('identify', 'ticketForm', {
        name: `${auth.account.firstName} ${auth.account.lastName}`,
        email: auth.account.emailAddress,
      });
    })
  }