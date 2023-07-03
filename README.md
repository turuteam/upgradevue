# Audience Manager

> Customer facing SAAS platform for setup and management of campaigns.

## Table of contents

- [Project Structure](#project-structure)
- [Application Lifecycle](#application-lifecycle)
- [Deploying](#deploying)
- [Quickstart](#quickstart)
- [Modules](#modules)
- [Test](#tests)
- [Resources](#resources)

---

### Project Structure

```bash
.
├── client/
│   ├── assets/                 # Uncompiled assets (fonts, images & styles)
│   ├── components/             # UI components
│   ├── layouts/                # Application layouts
│   ├── middleware/             # Custom function to be ran before rendering pages or layouts
│   ├── pages/                  # Pages components
│   ├── plugins/                # Plugins (ran before instantiating the application)
│   ├── static/                 # Pure static assets (directly copied)
│   ├── store/                  # State management (actions, mutations, getters)
│   └── utils/                  # Utils functions
├── tests/
│   ├── unit/                   # unit tests
│   │   ├── specs/              # test spec files
│   │   └── .eslintrc           # eslint config for tests
├── .babelrc                    # babel config
├── .editorconfig               # editor config
├── .eslintrc.js                # eslint config
├── .gitignore                  # git ignore list
├── .nvmrc                      # nvm config
├── jest.config.js              # Jest configuration
├── nuxt.config.js              # Nuxt configuration
├── package.json                # build scripts and dependencies
├── postbuild.js                # Postbuild script (netlify redirections, robots.txt, gzip)
├── README.md                   # This file ;)
└── yarn.lock                   # yarn lock file
```

### Application Lifecycle

#### Vue components Lifecycle

![component-lifecycle](https://user-images.githubusercontent.com/2362138/32821198-4c5594e0-ca26-11e7-99f4-ca2a86fe8ed3.png)

#### Nuxt Lifecycle

![nuxt-schema](https://user-images.githubusercontent.com/2362138/32821295-b69a44ae-ca26-11e7-8597-62405a299b78.png)
![nuxt-views-schema](https://user-images.githubusercontent.com/2362138/32821296-b6ca7796-ca26-11e7-8973-656e0f040527.png)

#### In details

![nuxt-lifecycle-hooks](https://user-images.githubusercontent.com/2362138/40898855-0bb39a16-6807-11e8-859a-c65ab4cafe76.jpg)

![nuxt-modules](https://user-images.githubusercontent.com/2362138/40898860-1448aef0-6807-11e8-8089-8475737a180f.jpg)

---

### Deploying

Any commits will run tests & automatic deployments on Netlify.

#### Netlify settings

```bash
# Build command
yarn test && export NODE_ENV=production && yarn generate && yarn postbuild

# Publish directory
dist
```

#### Environment variables

You can use these environment variables to control how AM2 will resolve the 
`campaign` microservice to make API calls against.

The `AR_AM_` prefixed environment variables are those use by AM (Audience Manager) 
while those prefixed with `AR_CAMPAIGN_CLIENT_` are those used by the campaign 
client when building it.

| Variable                               | Value                |
| -------------------------------------- | -------------------- |
| AR_CAMPAIGN_CLIENT_API_DOMAIN          | https://dev1.arep.co |
| AR_CAMPAIGN_CLIENT_API_BASE_URI_PREFIX | /api/v1/cn           |
| AR_AM_CAMPAIGN_API_DOMAIN              | http://dev1.arep.co  |
| AR_AM_CAMPAIGN_API_BASE_URI_PREFIX     | /api/v1/cn           |
| AR_AM_CAMPAIGN_API_PROMOTER_URI_PREFIX | /promoter            |
| AR_AM_CAMPAIGN_CLIENT_DOMAIN           | http://dev1.arep.co  |
| AR_AM_AUDIENCE_MANAGER_URL          | http://dev1.arep.co  |
| YARN_VERSION                           | 1.7.0                |
| YARN_FLAGS                             | --force              |

As a BASH script, against `dev1`:

```bash
export AR_AM_CAMPAIGN_API_DOMAIN=http://dev1.arep.co
export AR_AM_CAMPAIGN_API_BASE_URI_PREFIX=/api/v1/cn
export AR_AM_CAMPAIGN_API_PROMOTER_URI_PREFIX=/promoter
export AR_AM_CAMPAIGN_CLIENT_DOMAIN=http://dev1.arep.co
export AR_AM_AUDIENCE_MANAGER_URL=http://dev1.arep.co
```

and if running development locally:

```bash
export AR_AM_CAMPAIGN_API_DOMAIN=http://localhost:8080
export AR_AM_CAMPAIGN_API_BASE_URI_PREFIX=/api/v1/cn
export AR_AM_CAMPAIGN_API_PROMOTER_URI_PREFIX=/promoter
export AR_AM_CAMPAIGN_CLIENT_DOMAIN=http://localhost:8080
export AR_AM_AUDIENCE_MANAGER_URL=http://localhost
```

#### Snippet injection

- forEach polyfill for EDGE

```html
<script>
  (function() {
    if (typeof NodeList.prototype.forEach === 'function') return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
  })();
</script>
```

#### Asset optimization

| Parameters      | On  |
| --------------- | --- |
| Pretty URLs     | Y   |
| Bundle CSS      | Y   |
| Minify CSS      | Y   |
| Bundle JS       | N   |
| Minify JS       | Y   |
| Compress Images | Y   |

---

### Quickstart

#### Prerequisites

- [Yarn](https://yarnpkg.com/lang/en/docs/install/#mac-tab)
- Minimum [Node.js 8.0.0](https://nodejs.org/en/) requirement of [Nuxt 1.0.0](https://github.com/nuxt/nuxt.js/releases/tag/v1.0.0)

```bash
# Ensure you have the prerequisites
# install
brew install node yarn

# OR update
brew update && brew upgrade && brew cleanup

# install dependencies
yarn

# serve with hot reload at localhost:9091
yarn dev

# build for production with minification
# NODE_ENV should be specified before running this function (e.g: export NODE_ENV=production && yarn generate)
yarn generate

# run all tests
yarn test
```

---

### Modules

**@nuxtjs/axios**

Axios integration with Nuxt.js

**@nuxtjs/pwa**

Turn the application to a PWA (only used for offline caching for now).

**babel-polyfill**

Inject necessary polyfills for outdated browser

**normalize.css**

A modern alternative to CSS resets

**nuxt**

The nuxt javascript framework built on top of Vue.js.

**vue-scrollto**

Vue component to scroll to elements.

**vuex-router-sync**

Sync vue-router's current $route as part of vuex store's state.

---

### Tests

```sh
# Eslint
yarn test:eslint

# Unit test
yarn test:unit

# E2E test
# TBD, planning to use https://www.cypress.io/

# Watch your unit tests
yarn test:unit --watch
```

#### Unit

Let's make sure every component has the following tests:

- Render the correct DOM tree with the `data` passed from the `props`.
- Correctly update the DOM on any specific interaction (computed/actions/methods).
- Methods returns or throw on correct/invalid input.
- Store's actions & mutations are updating the store's state correctly (globally & in the component).
- Match the snapshot (if you updated the component, make sure you update the snapshot by running `yarn test:local -u`).

#### E2E (TBD)

Mostly for pages, let's make sure the scenario is well established for every page:

...

---

### Resources

- [Vue Devtools](https://github.com/vuejs/vue-devtools): Chrome devtools
  extension for debugging Vue.js.
- [Vue Performance Devtool](https://chrome.google.com/webstore/detail/vue-performance-devtool/koljilikekcjfeecjefimopfffhkjbne/)
- [Mozilla JavaScript References](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [VueJS Website](https://vuejs.org/)
- [NuxtJS Website](https://nuxtjs.org/)
- [Webpack Template documentation](https://vuejs-templates.github.io/webpack/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/en/)
- [Jest Documentation](https://facebook.github.io/jest/docs/en/expect.html)
- [Git Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
