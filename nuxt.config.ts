// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path'
import webpack from "webpack";
import { defineNuxtConfig } from 'nuxt/config'

// Load environment vairables from .env file if exists
import dotenv from 'dotenv'
dotenv.config();

export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Audience Republic',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#7344c0' },
        { name: 'msapplication-navbutton-color', content: '#7344c0' },
        {
          hid: 'description',
          name: 'description',
          content: 'Set up campaigns to make your event go viral, driving sales to your existing ticketing provider.'
        }
      ],
      link: [{ rel: 'shortcut icon', type: 'image/x-icon', href: 'https://cdn.arep.co/img/favicon/favicon.ico' }],
    }
  },
  ssr: false,
  srcDir: 'client/',
  generate: {
    // minify: {
    //   removeOptionalTags: false
    // },
    routes: [
      '/'
    ],
    // subFolders: false
  },
  ignore: [
    '**/__mocks__'
  ],
  // Environment variables
  runtimeConfig: {
    arCampaignApiDomain: process.env.AR_AM_CAMPAIGN_API_DOMAIN || 'https://dev1.arep.co',
    arCampaignApiBaseUriPrefix: process.env.AR_AM_CAMPAIGN_API_BASE_URI_PREFIX || '/api/v1/cn',
    arCampaignApiPromoterUriPrefix: process.env.AR_AM_CAMPAIGN_API_PROMOTER_URI_PREFIX || '/promoter',
    arCampaignClientCdnDomain: process.env.AR_AM_CAMPAIGN_CLIENT_CDN_DOMAIN || 'https://dev-cdn.arep.co',
    arSdkUrl: process.env.AR_AM_SDK_URL || 'https://sdk-cdn.arep.co/dev/v1.0.6/sdk.min.js',
    arHubspotScriptsUrl: process.env.AR_AM_HUBSPOT_SCRIPTS_URL || 'https://js.hs-scripts.com/4014538.js',
    arCampaignClientDomain: process.env.AR_AM_CAMPAIGN_CLIENT_DOMAIN || 'https://dev1.arep.co',
    arPrivacyPortalDomain: process.env.AR_AM_PRIVACY_PORTAL_DOMAIN || 'dev1-portal.arep.co',
    arAudienceManagerUrl: process.env.AR_AM_AUDIENCE_MANAGER_URL || 'http://localhost:3001',
    arAudienceManagerApiDomain: process.env.AR_AM_AUDIENCE_MANAGER_API_DOMAIN || 'https://dev1.arep.co',
    arWaveRegistrationLoginUrl: process.env.AR_AM_WAVE_REGISTRATION_LOGIN_URL || 'https://audiencerepublic.com',
    arUnlayerProjectId: parseInt(process.env.AR_UNLAYER_PROJECT_ID, 10),
    arUnlayerApiKey: process.env.AR_UNLAYER_API_KEY,
    arStripePulicKey: process.env.AR_STRIPE_PUBLIC_KEY || 'pk_test_NJnT6TvRkjIldkXwaxNx9H6b',
    arEnableWidget: process.env.AR_AM_ENABLE_WIDGET === 'true',
    arEnableFbMessenger: process.env.AR_AM_ENABLE_FB_MESSENGER === 'true',
    arEnableFbCa: process.env.AR_AM_ENABLE_FB_CA === 'true',
    arEnableEmailSending: process.env.AR_AM_ENABLE_EMAIL_SENDING === 'true',
    arEnableUnlayerInsertEvent: process.env.AR_AM_ENABLE_UNLAYER_INSERT_EVENT === 'true',
    arEnableOnboardingProcess: process.env.AR_AM_ENABLE_ONBOARDING_PROCESS === 'true',
    arEnableActivationState: process.env.AR_AM_ENABLE_ACTIVATION_STATE === 'true',
    arEnableCustomerProfiles: process.env.AR_AM_ENABLE_CUSTOMER_PROFILES === 'true',
    arEnablePrivacyPortal: process.env.AR_AM_ENABLE_PRIVACY_PORTAL === 'true',
    arMaintenanceMode: process.env.AR_AM_MAINTENANCE_MODE === 'true',
    arEnvironment: process.env.AR_AM_ENVIRONMENT || 'development', // 'production' | 'staging' | 'development'
    arShortUrlDomain: process.env.AR_AM_SHORT_URL_DOMAIN || 'https://arep.cc',
    arEnableShopifyIntegration: process.env.AR_AM_ENABLE_SHOPIFY_INTEGRATION === 'true',
    arEnableHumanitixIntegration: process.env.AR_AM_ENABLE_HUMANITIX_INTEGRATION === 'true',
    arEnableZoomIntegration: process.env.AR_AM_ENABLE_ZOOM_INTEGRATION === 'true',
    arEnablePatreonIntegration: process.env.AR_AM_ENABLE_PATREON_INTEGRATION === 'true',
    arEnableMemberfulIntegration: process.env.AR_AM_ENABLE_MEMBERFUL_INTEGRATION === 'true',
    arEnableUniverseIntegration: process.env.AR_AM_ENABLE_UNIVERSE_INTEGRATION === 'true',
    arEnableStripeIntegration: process.env.AR_AM_ENABLE_STRIPE_INTEGRATION === 'true',
    arEnableTicketekIntegration: process.env.AR_AM_ENABLE_TICKETEK_INTEGRATION === 'true',
    arEnableMoshtixIntegration: process.env.AR_AM_ENABLE_MOSHTIX_INTEGRATION === 'true',
    arEnableEventixIntegration: process.env.AR_AM_ENABLE_EVENTIX_INTEGRATION === 'true',
    arEnableEventRSVP: process.env.AR_AM_ENABLE_EVENT_RSVP === 'true',
    arEnableRichTextEmail: process.env.AR_AM_ENABLE_RICH_TEXT_EMAIL === 'true',
    arEnableTicketSalesFilter : process.env.AR_AM_ENABLE_TICKET_SALES_FILTER === 'true',
    arEnableMessageAdvancedTargeting : process.env.AR_AM_ENABLE_ADV_TARGETING === 'true',
    arEnableZoomGraphs : process.env.AR_AM_ENABLE_ZOOM_GRAPHS === 'true',
    arEnableSalesChartFilter: process.env.AR_AM_ENABLE_SALES_CHART_FILTER === 'true',
    arEnableEventRegistrationChart: process.env.AR_AM_ENABLE_EVENT_REG_GRAPH === 'true',
    arEnablePageViewsGraphs : process.env.AR_AM_ENABLE_PAGE_VIEWS_GRAPH === 'true',
    arEnableMessageFromEvent: process.env.AR_AM_ENABLE_MESSAGE_FROM_EVENT === 'true',
    arEnableAutomation : process.env.AR_AM_ENABLE_AUTOMATION === 'true',
    arEnableFanActiveMembership: process.env.AR_AM_ENABLE_FAN_ACTIVE_MEMBERSHIP === 'true',
    arEnableEventGeniusIntegration: process.env.AR_AM_ENABLE_EVENT_GENIUS_INTEGRATION === 'true',
    arEnableDashboard: process.env.AR_AM_ENABLE_DASHBOARD === 'true',
    arEnableDiceIntegration: process.env.AR_AM_ENABLE_DICE_INTEGRATION === 'true',
    arEnableSeeTicketsUKIntegration: process.env.AR_AM_ENABLE_SEETICKETSUK_INTEGRATION === 'true',
    arPendoAPIKey: process.env.AR_AM_PENDO_API_KEY,
    arFreshdeskWidgetID: process.env.AR_AM_FRESHDESK_WIDGET_ID,
    arFreshdeskWidgetUrl: process.env.AR_AM_FRESHDESK_WIDGET_URL,
    arEnableFreshdeskButton: process.env.AR_AM_ENABLE_FRESHDESK_BUTTON === 'true',
    arSalesforceID: process.env.AR_AM_SALESFORCE_ID,
    arEnableBeefreeEmail: process.env.AR_AM_ENABLE_BEEFREE_EMAIL === 'true',
    arEnableBeefreePreviewDynamicTags: process.env.AR_AM_ENABLE_BEEFREE_PREVIEW_DYNAMIC_TAGS === 'true',
    arEnableBeefreeShowStructure: process.env.AR_AM_ENABLE_BEEFREE_SHOW_STRUCTURE === 'true',
    arEnableTryBookingIntegration: process.env.AR_AM_ENABLE_TRY_BOOKING_INTEGRATION === 'true'
  },
  css: [
    'normalize.css',
    '@/assets/styles/main.scss',
    path.resolve(__dirname, 'node_modules/arep-ui/dist/styles/index.css'),
  ],
  plugins: [
    { src: '~/plugins/arep-ui.js' },
    { src: '~/plugins/ar-api/index.ts' },
    { src: '~/plugins/ar-components.js' },
    { src: '~/plugins/ar-ga.js', ssr: false },
    { src: '~/plugins/ar-hubspot.js' },
    { src: '~/plugins/ar-pendo.js' },
    { src: '~/plugins/ar-freshdesk.js' },
    { src: '~/plugins/ar-feature-mask/index.js' },
    { src: '~/plugins/ar-notification/index.ts' },
    { src: '~/plugins/ar-utils/index.ts' },
    { src: '~/plugins/ar-hotkey' },
    { src: '~/plugins/ar-sticky-top.js' },
    { src: '~/plugins/ar-filters.js' },
    { src: '~/plugins/ar-fuzzy-search.ts' },
    { src: '~/plugins/ar-axios.ts' },
    { src: '~/plugins/init.js' },
    { src: '~/plugins/vue-portal.js' },
    { src: '~/plugins/vue-draggable.js'},
    { src: '~/plugins/vue-leaderline.js'},
    { src: '~/plugins/vue-scrollto.js' },
    { src: '~/plugins/vee-validate.js' },
    { src: '~/plugins/vue-croppie.js' },
    { src: '~/plugins/vue-infinite-scroll.js' },
    { src: '~/plugins/v-tooltip.js' },
    { src: '~/plugins/v-click-outside.js' },
    { src: '~/plugins/is-browser.js' },
    { src: '~/plugins/ar-web-worker/index.ts', ssr: false },
    { src: '~plugins/vue-input-autowidth.js', ssr: false },
    { src: '~plugins/vue-apexcharts.js', ssr: false },
    { src: '~plugins/sentry.js' }
  ],
  // modules: ['@nuxtjs/axios', '@nuxtjs/router', '@nuxtjs/style-resources', 'portal-vue/nuxt', '@nuxtjs/sentry', '@nuxt/typescript-build', '@nuxtjs/svg'],
  // sentry: {
  //   dsn: 'https://db7b76f4c7994408ae42fffd928bbe55@o4504867917529088.ingest.sentry.io/4504884952956928',
  //   environment: process.env.AR_AM_ENVIRONMENT || 'development',
  //   tracing: {
  //     tracesSampleRate: 1.0,
  //     browserTracing: {},
  //     vueOptions: {
  //       trackComponents: true,
  //     },
  //   },
  //   clientIntegrations: {
  //     CaptureConsole: { levels: ['warn', 'error'] },
  //   },
  // },
  // styleResources: {
  //   scss: [
  //     path.resolve(__dirname, 'node_modules/arep-ui/dist/styles/variables.scss'),
  //     path.resolve(__dirname, 'node_modules/arep-ui/dist/styles/functions.scss'),
  //     path.resolve(__dirname, 'client/assets/styles/base/_variables.scss'),
  //     path.resolve(__dirname, 'client/assets/styles/base/_functions.scss'),
  //   ]
  // },
  vite: {
    css: {
      preprocessorOptions: {
        scss: [
          path.resolve(__dirname, 'node_modules/arep-ui/dist/styles/variables.scss'),
          path.resolve(__dirname, 'node_modules/arep-ui/dist/styles/functions.scss'),
          path.resolve(__dirname, 'client/assets/styles/base/_variables.scss'),
          path.resolve(__dirname, 'client/assets/styles/base/_functions.scss'),
        ]
      }
    }
  },

  // axios: {
  //   baseURL: `${process.env.AR_AM_AUDIENCE_MANAGER_API_DOMAIN || 'https://dev1.arep.co'}${process.env.AR_AM_CAMPAIGN_API_BASE_URI_PREFIX || '/api/v1/cn'}`,
  //   redirectError: {
  //     401: '/authenticate/login'
  //   }
  // },

  $meta: {
    ogTitle: false,
    ogDescription: false
  },

  typescript: {
    builder: false,
    // typeCheck: {
    //   // It takes so long to build, so let's disable it for now
    //   eslint: {
    //     files: './**/*.{ts}',
    //     enabled: false
    //   }
    // }
    typeCheck: true
  },

  /*
  ** Build configuration
  */
  // build: {
  //   vendor : ['vue-apexchart'],
  //   extend (config, { isClient }) {
  //     // Extend only webpack config for client-bundle
  //     if (isClient) {
  //       config.devtool = '#source-map';
  //       config.plugins.push(
  //         // Ignore all locale files of moment.js
  //         new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  //       );
  //       config.module.rules.push({
  //         test: /\.worker\.js$/,
  //         loader: 'worker-loader',
  //         exclude: /(node_modules)/
  //       })
  //     }
  //   },

  // hooks: {
  //   'vite:extendConfig': (config, {isClient}) => {
  //     if(isClient) {
  //       config.devtool = '#source-map';
  //       config.plugins.push(
  //         // Ignore all locale files of moment.js
  //         new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  //       );
  //       config.module.rules.push({
  //         test: /\.worker\.js$/,
  //         loader: 'worker-loader',
  //         exclude: /(node_modules)/
  //       })
  //     }
  //   }
  // },

    //parallel: true,

    // splitChunks: {
    //   layouts: false, // Our layout chunks are very small, which makes no send to split it
    //   pages: true, // TODO - this doesn't work, because we're not using the proper way to manage routes
    //   commons: true
    // },

    webpack: {
      extractCSS: true
    }
})
