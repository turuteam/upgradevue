import Vue from 'vue';
import Router from 'vue-router';

/**
 * Campaigns
 */

import Campaigns from '~/pages/campaigns';

import CampaignModify from '~/pages/campaigns/modify';
import CampaignModifyConnect from '~/pages/campaigns/modify/connect';
import CampaignModifyDetails from '~/pages/campaigns/modify/details/';
import CampaignModifyInvite from '~/pages/campaigns/modify/invite';
import CampaignModifyRegistrations from '~/pages/campaigns/modify/registrations';
import CampaignModifyRewards from '~/pages/campaigns/modify/rewards/';
import CampaignModifyShare from '~/pages/campaigns/modify/share';

import CampaignView from '~/pages/campaigns/view';
import CampaignViewDashboard from '~/pages/campaigns/view/dashboard';
import CampaignViewInsights from '~/pages/campaigns/view/insights';
import CampaignViewRegistrations from '~/pages/campaigns/view/registrations';

import CampaignSetup from '~/pages/campaigns/setup';
import CampaignSetupType from '~/pages/campaigns/setup/type';
import CampaignSetupEvent from '~/pages/campaigns/setup/event';

/**
 * Tours
 */

import TourView from '~/pages/tours/view';
import TourViewCampaigns from '~/pages/tours/view/campaigns';
import TourSetup from '~/pages/tours/setup';

/**
 * Events
 */

import Events from '~/pages/events';

import EventModify from '~/pages/events/modify';

import EventView from '~/pages/events/view';
import EventCampaigns from '~/pages/events/view/campaigns';
import EventInsights from '~/pages/events/view/insights';
import EventOrders from '~/pages/events/view/orders';
import EventAttendance from '~/pages/events/view/attendees';
import EventSales from '~/pages/events/view/sales/';

import EventRSVP from '~/pages/events/event-rsvp';
import EventRSVPBasic from '~/pages/events/event-rsvp/basic';
import EventRSVPRegister from '~/pages/events/event-rsvp/register';
import EventRSVPPlatform from '~/pages/events/event-rsvp/platform';

import Login from '~/pages/authenticate/login';
import EmailVerify from '~/pages/authenticate/email-verify';
import ForgotPassword from '~/pages/authenticate/forgot-password';
import ResetPassword from '~/pages/authenticate/reset-password/';
import Signup from '~/pages/authenticate/onboarding/signup';
import ImportSalesData from '~/pages/authenticate/onboarding/import-sales-data';
import BillingDetails from '~/pages/authenticate/onboarding/billing-details';

// Audience page[s]
import Audience from '~/pages/audience/index';

import CustomerProfile from '~/pages/audience/view/';
import CustomerProfileActivity from '~/pages/audience/view/activity';
import CustomerProfileCampaigns from '~/pages/audience/view/campaigns';
import CustomerProfileEvents from '~/pages/audience/view/events';
import CustomerProfileOverview from '~/pages/audience/view/overview';
import CustomerProfilePurchases from '~/pages/audience/view/purchases';

/**
 * Admin
 */
import Admin from '~/pages/admin/';
import AdminDashboard from '~/pages/admin/dashboard';
import AdminMessageTasks from '~/pages/admin/message-tasks';
import AdminPermissions from '~/pages/admin/permissions';
import AdminStaffAccounts from '~/pages/admin/staff-accounts';
import AdminAccountsModify from '~/pages/admin/modify-account';
import AdminFixes from '~/pages/admin/fixes';

// Automation
import Automation from '~/pages/automation/';
import CreateAutomation from '~/pages/automation/create';

// Privacy Portal
import PrivacyPortal from '~/pages/privacy-portal/';

// Integrations

// Settings
import Settings from '~/pages/settings/';
import SettingsApiTokens from '~/pages/settings/api-tokens';
import SettingsProfile from '~/pages/settings/profile/';
import SettingsPassword from '~/pages/settings/password/';
import SettingsSubscriptions from '~/pages/settings/subscriptions/';
import SettingsBilling from '~/pages/settings/billing/';
import SettingsIntegrations from '~/pages/settings/integrations/index.js';
import IntegrationContainer from '~/pages/settings/integrations/integration-container/';

/**
 * Messages
 */

import MessageCenter from '~/pages/message-center/';

import MessageCenterMessages from '~/pages/message-center/messages';
import MessageCenterMessageView from '~/pages/message-center/messages/view/';
import MessageCenterMessageViewOverview from '~/pages/message-center/messages/view/overview';
import MessageCenterMessageViewRecipients from '~/pages/message-center/messages/view/recipients';
import MessageCenterMessageViewInsights from '~/pages/message-center/messages/view/insights';
import MessageCenterMessageViewLinkActivity from '~/pages/message-center/messages/view/link-activity';
import MessageCenterMessageViewDeliverability from '~/pages/message-center/messages/view/deliverability';
import MessageCenterMessageViewConversions from '~/pages/message-center/messages/view/conversions';

import MessageCenterForms from '~/pages/message-center/forms';
import MessageCenterListOptInFormsModify from '~/pages/message-center/forms/modify/';
import MessageCenterListOptInFormsModifyBasic from '~/pages/message-center/forms/modify/basic';
import MessageCenterListOptInFormsModifyDetails from '~/pages/message-center/forms/modify/details';

import MessageCenterLists from '~/pages/message-center/lists';
import MessageCenterListView from '~/pages/message-center/lists/view';
import MessageCenterListContacts from '~/pages/message-center/lists/view/contacts/';

import MessageCenterMessageModify from '~/pages/message-center/modify/message';
import MessageCenterMessageModifySms from '~/pages/message-center/modify/message/sms/';
import MessageCenterMessageModifyFacebookMessenger from '~/pages/message-center/modify/message/facebook-messenger/';
import MessageCenterEmailModify from '~/pages/message-center/modify/email';
import MessageCenterEmailModifyBasic from '~/pages/message-center/modify/email/basic';
import MessageCenterEmailModifyTemplate from '~/pages/message-center/modify/email/emailTemplate';
import MessageCenterEmailModifySchedule from '~/pages/message-center/modify/email/schedule';

import MessageCenterTemplates from '~/pages/message-center/templates';
import MessageCenterTemplateModify from '~/pages/message-center/templates/modify/';

import MessageCenterPreview from '~/pages/message-center/preview';

/**
 * Plans
 */
import Plans from '~/pages/plans/';
import PlanSubscribe from '~/pages/plans/view/subscribe/';

import Insights from '~/pages/insights';

import NotAccessible from '~/pages/exceptions/not-accessible';

import Maintenance from '~/pages/exceptions/maintenance';

/**
 * Dashboard
 */
import Dashboard from '~/pages/dashboard';

const scrollBehavior = function(to, from, savedPosition) {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false;

  // if no children detected
  if (to.matched.length < 2) {
    // scroll to the top of the page
    position = { x: 0, y: 0 };
  } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 };
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition;
  }

  return new Promise(resolve => {
    // wait for the out transition to complete (if necessary)
    window.$nuxt.$once('triggerScroll', () => {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      if (to.hash && document.querySelector(to.hash)) {
        // scroll to anchor by returning the selector
        position = { selector: to.hash };
      }
      resolve(position);
    });
  });
};

Vue.use(Router);

export function createRouter() {
  let routes = [];

  // Exceptions
  routes.push({
    path: '/not-accessible',
    component: NotAccessible
  });

  // NOTE: If we're in maintenance mode, we must exclude all other routes otherwise those pages
  // will still be accessible. Even if we attempt to redirect all pages to the maintenance page,
  // any exact matches will take precedence. Also, only create the `maintenance` route on an
  // as-needed basis.
  if (process.env.arMaintenanceMode) {
    routes.push({
      path: '/maintenance',
      component: Maintenance
    });

    routes.push({
      path: '/*',
      redirect: '/maintenance'
    });
  } else {
    // Campaigns
    (() => {
      const modifyComponents = [
        ['connect', CampaignModifyConnect],
        ['details', CampaignModifyDetails],
        ['invite', CampaignModifyInvite],
        ['registrations', CampaignModifyRegistrations],
        ['rewards', CampaignModifyRewards],
        ['share', CampaignModifyShare]
      ];

      const setupComponents = [['type', CampaignSetupType], ['event', CampaignSetupEvent]];

      const viewComponents = [
        ['dashboard', CampaignViewDashboard],
        ['insights', CampaignViewInsights],
        ['registrations', CampaignViewRegistrations]
      ];

      routes.push({
        path: '/campaigns',
        component: Campaigns
      });

      routes.push({
        name: 'campaigns-edit',
        path: '/campaigns/:oid/edit/',
        component: CampaignModify,
        meta: { skipHistory: true },
        children: modifyComponents.map(component => {
          return {
            path: component[0],
            component: component[1],
            meta: { skipHistory: true }
          };
        })
      });

      routes.push({
        name: 'campaigns-new',
        path: '/campaigns/new/',
        component: CampaignModify,
        meta: { skipHistory: true },
        props: true,
        children: modifyComponents.map(component => {
          return {
            name: `campaigns-new-${component[0]}`,
            path: component[0],
            component: component[1],
            meta: { skipHistory: true },
            props: true
          };
        })
      });

      const setupProps = route => {
        return {
          campaignType: route.query.type,
          eventOid: route.query.eventOid
        };
      };

      routes.push({
        path: '/campaigns/setup/',
        name: 'campaignSetup',
        component: CampaignSetup,
        props: setupProps,
        meta: { skipHistory: true },
        children: setupComponents.map(component => {
          return {
            name: `campaignSetup-${component[0]}`,
            path: component[0],
            component: component[1],
            props: true,
            meta: { skipHistory: true }
          };
        })
      });

      routes.push({
        path: '/campaigns/:oid/view',
        component: CampaignView,
        meta: { historyGroup: 'campaign-view' },
        children: viewComponents.map(component => {
          return {
            path: component[0],
            component: component[1],
            meta: { historyGroup: 'campaign-view' }
          };
        })
      });
    })();

    // Tours
    (() => {
      const viewComponents = [['campaigns', TourViewCampaigns]];

      routes.push({
        path: '/tours/:oid/view',
        component: TourView,
        meta: { historyGroup: 'tour-view' },
        children: viewComponents.map(component => {
          return {
            path: component[0],
            component: component[1],
            meta: { historyGroup: 'tour-view' }
          };
        })
      });

      routes.push({
        path: '/tours/setup/',
        component: TourSetup,
        meta: { skipHistory: true }
      });
    })();

    // Dashboard
    (() => {
      routes.push({
        path: '/dashboard',
        component: Dashboard
      });
    })();

    // Events
    (() => {
      const baseModifyPaths = ['/events/:oid/edit', '/events/new'];

      const viewComponents = [
        ['insights', EventInsights],
        ['attendees', EventAttendance],
        ['sales', EventSales],
        ['campaigns', EventCampaigns],
        ['orders', EventOrders]
      ];

      routes.push({
        path: '/events',
        component: Events
      });

      baseModifyPaths.forEach(basePath => {
        routes.push({
          path: basePath,
          component: EventModify,
          meta: { skipHistory: true }
        });
      });

      const baseRSVPPaths = ['/events/:oid/edit/event-rsvp', '/events/new/event-rsvp'];

      const eventRSVPComponents = [
        ['basic', EventRSVPBasic],
        ['register', EventRSVPRegister],
        ['platform', EventRSVPPlatform]
      ];
      baseRSVPPaths.forEach(basePath => {
        routes.push({
          path: basePath,
          component: EventRSVP,
          meta: { skipHistory: true },
          children: eventRSVPComponents.map(component => {
            return {
              path: component[0],
              component: component[1],
              meta: { skipHistory: true }
            };
          })
        });
      });

      routes.push({
        path: '/events/:oid/view',
        component: EventView,
        meta: { historyGroup: 'event-view' },
        children: viewComponents.map(component => {
          return {
            path: component[0],
            component: component[1],
            meta: { historyGroup: 'event-view' }
          };
        })
      });
    })();

    // Admin
    (() => {
      const adminComponents = [
        ['dashboard', AdminDashboard],
        ['message-tasks', AdminMessageTasks],
        ['permissions', AdminPermissions],
        ['accounts', AdminStaffAccounts],
        ['fixes', AdminFixes]
      ];
      routes.push({
        path: '/admin',
        component: Admin,
        meta: { skipHistory: true },
        children: adminComponents.map(component => {
          return {
            path: component[0],
            component: component[1],
            meta: { skipHistory: true }
          };
        })
      });
      routes.push({
        path: '/admin/accounts/:oid/edit/',
        component: AdminAccountsModify
      });
      routes.push({
        path: '/admin/accounts/new/',
        component: AdminAccountsModify
      });
    })();

    // Automation
    (() => {
      const viewComponents = [['create', CreateAutomation]];

      routes.push({
        path: '/automation',
        component: Automation
      });

      if (process.env.arEnableAutomation) {
        routes.push({
          path: '/automation/create',
          component: CreateAutomation,
          meta: { skipHistory: true }
        });
        routes.push({
          path: '/automation/edit',
          component: CreateAutomation,
          meta: { skipHistory: true }
        });
      }
    })();

    // Audience
    (() => {
      const viewComponents = [
        ['activity', CustomerProfileActivity],
        ['campaigns', CustomerProfileCampaigns],
        ['events', CustomerProfileEvents],
        ['overview', CustomerProfileOverview],
        ['purchases', CustomerProfilePurchases]
      ];

      routes.push({
        path: '/audience',
        component: Audience
      });

      if (process.env.arEnableCustomerProfiles) {
        routes.push({
          path: '/audience/:oid/view',
          component: CustomerProfile,
          meta: { historyGroup: 'contact-view' },
          children: viewComponents.map(component => {
            return {
              path: component[0],
              component: component[1],
              meta: { historyGroup: 'contact-view' }
            };
          })
        });
      }
    })();

    // Privacy Portal
    (() => {
      if (process.env.arEnablePrivacyPortal) {
        routes.push({
          path: '/privacy-portal',
          component: PrivacyPortal
        });
      }
    })();

    // Insights
    (() => {
      routes.push({
        path: '/insights',
        component: Insights
      });
    })();

    // Message Preview
    (() => {
      routes.push({
        path: '/message-preview/:hash/',
        component: MessageCenterPreview
      });
    })();

    // Message Center
    (() => {
      const messageCenterComponents = [
        ['messages', MessageCenterMessages],
        ['lists', MessageCenterLists],
        ['forms', MessageCenterForms]
      ];
      messageCenterComponents.push(['templates', MessageCenterTemplates]);

      routes.push({
        path: '/message-center',
        component: MessageCenter,
        children: messageCenterComponents.map(component => {
          return {
            path: component[0],
            component: component[1]
          };
        })
      });

      const viewComponents = [
        ['overview', MessageCenterMessageViewOverview],
        ['insights', MessageCenterMessageViewInsights],
        ['recipients', MessageCenterMessageViewRecipients],
        ['link-activity', MessageCenterMessageViewLinkActivity],
        ['deliverability', MessageCenterMessageViewDeliverability],
        ['conversions', MessageCenterMessageViewConversions]
      ];

      if (process.env.arEnableCustomerProfiles) {
        routes.push({
          path: '/message-center/messages/:oid/view',
          component: MessageCenterMessageView,
          meta: { historyGroup: 'contact-view' },
          children: viewComponents.map(component => {
            return {
              path: component[0],
              component: component[1],
              meta: { historyGroup: 'contact-view' }
            };
          })
        });
      }

      routes.push({
        path: '/message-center/forms',
        component: MessageCenterForms
      });

      routes.push({
        path: '/message-center/templates',
        component: MessageCenterTemplates
      });

      const MessageCenterListViewComponents = [['contacts', MessageCenterListContacts]];

      routes.push({
        path: '/message-center/lists/:oid',
        component: MessageCenterListView,
        children: MessageCenterListViewComponents.map(component => {
          return {
            path: component[0],
            component: component[1]
          };
        })
      });

      routes.push({
        name: 'templates-edit',
        path: '/message-center/templates/:emailTemplateOid/edit',
        component: MessageCenterTemplateModify,
        meta: { skipHistory: true }
      });

      routes.push({
        name: 'templates-new',
        path: '/message-center/templates/new',
        component: MessageCenterTemplateModify,
        meta: { skipHistory: true }
      });

      const messageListOptInFormModifyPaths = [
        '/message-center/signup-forms/:signupFormOid/edit',
        '/message-center/signup-forms/new'
      ];
      const messageListOptInFormModifyComponents = [
        ['basic', MessageCenterListOptInFormsModifyBasic],
        ['details', MessageCenterListOptInFormsModifyDetails]
      ];

      messageListOptInFormModifyPaths.forEach(basPath => {
        routes.push({
          path: basPath,
          component: MessageCenterListOptInFormsModify,
          meta: { skipHistory: true },
          children: messageListOptInFormModifyComponents.map(component => {
            return {
              path: component[0],
              component: component[1],
              meta: { skipHistory: true }
            };
          })
        });
      });

      const baseSmsModifyPaths = ['/message-center/messages/sms/:oid/edit', '/message-center/messages/sms/new'];
      baseSmsModifyPaths.forEach(basePath => {
        routes.push({
          path: basePath,
          component: MessageCenterMessageModify,
          meta: { skipHistory: true },
          children: [
            {
              path: '/',
              component: MessageCenterMessageModifySms,
              meta: { skipHistory: true }
            }
          ]
        });
      });

      const baseEmailModifyPaths = ['/message-center/messages/email/:oid/edit', '/message-center/messages/email/new'];
      const emailModifyComponents = [
        ['basic', MessageCenterEmailModifyBasic],
        ['template', MessageCenterEmailModifyTemplate]
      ];

      if (process.env.arEnableEmailSending) {
        baseEmailModifyPaths.forEach(basePath => {
          routes.push({
            path: basePath,
            component: MessageCenterEmailModify,
            meta: { skipHistory: true },
            children: emailModifyComponents.map(component => {
              return {
                path: component[0],
                component: component[1],
                meta: { skipHistory: true }
              };
            })
          });
        });
      }
    })();

    // Plans
    (() => {
      if (!process.env.arEnableActivationState) {
        return;
      }
      routes.push({
        path: '/plans',
        component: Plans
      });

      const planPages = [['subscribe', PlanSubscribe]];

      planPages.forEach(page => {
        routes.push({
          path: `/plans/:oid/${page[0]}`,
          component: page[1],
          meta: { skipHistory: true }
        });
      });
    })();

    // Settings
    (() => {
      const settingsComponents = [
        ['profile', SettingsProfile],
        ['password', SettingsPassword],
        ['subscriptions', SettingsSubscriptions],
        ['billing', SettingsBilling],
        ['integrations', SettingsIntegrations],
        ['api-tokens', SettingsApiTokens]
      ];
      routes.push({
        path: `/settings`,
        component: Settings,
        children: settingsComponents.map(component => {
          return {
            path: component[0],
            component: component[1]
          };
        })
      });
    })();

    // Integrations Container
    (() => {
      routes.push({
        path: `/settings/integrations/:integration`,
        component: IntegrationContainer
      });
    })();

    // Authenticates
    (() => {
      const viewComponents = [['login', Login], ['masquerade-login', Login], ['email-verify', EmailVerify]];

      if (process.env.arEnableOnboardingProcess) {
        viewComponents.push(['forgot-password', ForgotPassword]);
        viewComponents.push(['reset-password', ResetPassword]);
        viewComponents.push(['signup', Signup]);
        viewComponents.push(['import-sales-data', ImportSalesData]);
        viewComponents.push(['billing-details', BillingDetails]);
      }

      viewComponents.forEach(component => {
        routes.push({
          path: `/authenticate/${component[0]}`,
          component: component[1],
          meta: { skipHistory: true }
        });
      });
    })();

    routes.push({
      path: '/',
      redirect: '/campaigns'
    });

    // NOTE: need to manually redirect from maintenance page to
    // campaigns page since we don't have a default handler for
    // undefined routes (i.e., no 404 page).
    routes.push({
      path: '/maintenance',
      redirect: '/campaigns'
    });
  }

  let router = new Router({
    mode: 'history',
    scrollBehavior,
    routes
  });

  async function addToHistory(to, from) {
    if (router?.app?.$store) {
      // The router can init before the vue modules do, so lets make sure that if history length is 0, we add the previous path (if it exists)
      // TODO - Remove the from.query.skipHistory check if we don't end up using it for anything.
      if (
        router?.app?.$store?.state?.application.history.prev === null &&
        from.path !== '' &&
        !from.meta.skipHistory &&
        !from.query.skipHistory
      ) {
        await router.app.$store.commit('application/HISTORY_ADD', from.path);
      }

      // We can explicitly tell the router to skip adding an otherwise valid path to the history, either in a param or in the route definition
      if (to.meta.skipHistory) return;
      if (to.query.skipHistory) return;

      // If the source page and destination page both have a history group value which is the same, then avoid adding it to the history.
      if (from.meta.historyGroup && to.meta.historyGroup && from.meta.historyGroup === to.meta.historyGroup) return;

      // In case duplicate navigation is attempted, don't add a page to the history if it matches the current history page value.
      if (router?.app?.$store?.state?.application.history.page !== to.path) {
        await router.app.$store.commit('application/HISTORY_ADD', to.path);
      }
    }
  }

  router.afterEach((to, from) => {
    addToHistory(to, from);

    if (window.dataLayer) {
      console.log('dataLayer detected, pushing route change: %s, title %s', to.path, to.params.step);
      dataLayer.push({
        event: 'pageview',
        page: {
          path: to.path,
          title: to.params.step
        }
      });
    }
  });

  // Will attempt to push the router to the previous path stored in applicationHistory, then pops the history to remove the current page.
  // Effectively acts as a 'back', but without the ability for $router to accidentally send users to a page we don't want them to end
  // up on (eg an edit page).
  router.pop = async fallback => {
    const prevPath = router?.app?.$store?.state?.application?.history?.prev?.page || fallback || '/audience';
    await router.app.$store.commit('application/HISTORY_POP_LAST');
    await router.push(prevPath);
  };

  return router;
}
