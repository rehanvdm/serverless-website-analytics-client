# Serverless Website Analytics Client

- [Serverless Website Analytics Client](#serverless-website-analytics-client)
  * [Usage](#usage)
    + [Standalone Import Script Usage](#standalone-import-script-usage)
      - [Tracking](#tracking)
        * [Attribute tracking](#attribute-tracking)
        * [Manual tracking](#manual-tracking)
    + [SDK Client Usage](#sdk-client-usage)
      - [Vue](#vue)
      - [React](#react)
      - [Svelte](#svelte)
  * [Package src](#package-src)
  * [Developing](#developing)
  * [Contributing](#contributing)
  * [FAQ](#faq)
    + [The network calls to the backend fail with 403](#the-network-calls-to-the-backend-fail-with-403)
    + [Why not fetch with `keepalive` in the client](#why-not-fetch-with--keepalive--in-the-client)

## Usage

There are **two ways to use the client**:
- **Standalone import script** - Single line, standard JS script in your HTML.
- **SDK client** - Import the SDK client into your project and use in any SPA.

### Standalone Import Script Usage

Then include the standalone script in your HTML:
```html
<html lang="en">
<head> ... </head>
<body>
...
<script src="<YOUR BACKEND ORIGIN>/cdn/client-script.js" site="<THE SITE YOU ARE TRACKING>" attr-tracking="true"></script>
</body>
</html>
```

You need to replace `<YOUR BACKEND ORIGIN>` with the origin of your deployed backend. Available attributes on the script
are:
- `site` - Required. The name of your site, this must correspond with the name you specified when deploying the
`serverless-website-analytics` backend.
- `api-url` - Optional. Uses the same origin as the current script if not specified. This is the URL to the backend.
Allowing it to be specified opens a few use cases for testing.
- `attr-tracking` - Optional. If `"true"`, the script will track all `button` and `a` HTML elements that have the
`swa-event` attribute on them. Example: `<button swa-event="download">Download</button>`. See below for options.
- `serverless-website-analytics` - Optional. This is only required if the browser does not support `document.currentScript`
(All modern browsers since 2015 do). Only specify the tag, no value is needed.

#### Tracking

##### Attribute tracking

If you specified the `attr-tracking` attribute on the script tag, then all `button` and `a` HTML elements that have the
`swa-event` attribute on them will be tracked. The `swa-event` attribute is required and the following attributes are
available:
  - `swa-event-category` - Optional. The category of the event that can be used to group events.
  - `swa-event-data` - Optional. The data of the event. Defaults to 1.
  - `swa-event-async` - Optional. If present, the event will be sent asynchronously
    with no guarantee of delivery but a better chance of not being canceled if page is unloaded right after.

```html
<button swa-event="download">Download</button>

<button swa-event="download" swa-event-category="clicks">Download</button>

<button swa-event="buy" swa-event-category="clicks" swa-event-data="99">Buy now</button>

<a swa-event="click" swa-event-category="link" swa-event-data="2" swa-event-async>Click me</a>
```

##### Manual tracking

You can find the instantiated instance of the `serverless-website-analytics` component under the window at `window.swa`.
This enables you to call all the functions like tracking manually. Example:
```js
window.swa.v1.analyticsTrack('about_click')
```

#### Beacon/pixel tracking

Beacon/pixel tracking can be used as alternative to HTML attribute tracking. Beacon tracking is useful for
tracking events outside your domain, like email opens, external blog views, etc.
```html
<img src="<YOUR BACKEND ORIGIN>/api-ingest/v1/event/track/beacon.gif?site=<SITE>&event=<EVENT>" height="1" width="1" alt="">
```
The `site` and `event` fields are required. The `category` field and all the other fields are optional, except
the `referrer` field, which is not supported.

### SDK Client Usage

Install the client:
```
npm install serverless-website-analytics-client
```

Irrelevant of the framework, you have to do the following to track page views on your site:

1. Initialize the client only once with `analyticsPageInit`. The site name must correspond with one that you specified
when deploying the `serverless-website-analytics` backend. You also need the URL to the backend. Make sure your frontend
site's `Origin` is whitelisted in the backend config.
2. On each route change call the `analyticsPageChange` function with the name of the new page.

Beacon/pixel tracking is also supported but it is not recommended as it looses some info the SDK gathers. This includes
the `session_id`, `user_id` and `referrer`fields. The first two can still be specified but the `reffer` field ca not.

> [!IMPORTANT]
> The following sections show you how to do it in a few frameworks, but you can still DIY with the SDK in **ANY framework**.
> The [OpenAPI spec](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/package/src/OpenAPI-Ingest.yaml)
> can be used for any language that isn't TS/JS.


#### Vue

[_./usage/vue/vue-project/src/main.ts_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/vue/vue-project/src/main.ts)
```typescript
...
import * as swaClient from 'serverless-website-analytics-client';

const app = createApp(App);
app.use(router);

swaClient.v1.analyticsPageInit({
  inBrowser: true, //Not SSR
  site: "<Friendly site name>", //vue-project
  apiUrl: "<Your serverless-website-analytics URL>", //https://my-serverless-website-analytics-backend.com
  // debug: true,
});
router.afterEach((event) => {
  swaClient.v1.analyticsPageChange(event.path);
});

app.mount('#app');

export { swaClient };
```

Tracking:

[_./usage/vue/vue-project/src/App.vue_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/vue/vue-project/src/App.vue)
```typescript
import {swaClient} from "./main";
...
//                         (event: string, data?: number, category?: string)
swaClient.v1.analyticsTrack("vue", count.value, "test")
```

#### React

[_./usage/react/react-project/src/main.tsx_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/react/react-project/src/main.tsx)
```typescript
...
import * as swaClient from 'serverless-website-analytics-client';

const router = createBrowserRouter([
  ...
]);

swaClient.v1.analyticsPageInit({
  inBrowser: true, //Not SSR
  site: "<Friendly site name>", //vue-project
  apiUrl: "<Your serverless-website-analytics URL>", //https://my-serverless-website-analytics-backend.com
  // debug: true,
});

router.subscribe((state) => {
  swaClient.v1.analyticsPageChange(state.location.pathname);
});
swaClient.v1.analyticsPageChange("/");

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
</React.StrictMode>,
)

export { swaClient };
```

Tracking:

[_./usage/react/react-project/src/App.tsx_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/react/react-project/src/App.tsx)
```typescript
import {swaClient} from "./main.tsx";
...
//                         (event: string, data?: number, category?: string)
swaClient.v1.analyticsTrack("vue", count.value, "test")
````

#### Svelte

[_./usage/svelte/svelte-project/src/App.svelte_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/svelte/svelte-project/src/App.svelte)
```sveltehtml
<!-- Show the router -->
<Router {routes}  on:routeLoaded={routeLoaded} />

<script context="module">
import Router from 'svelte-spa-router'
import * as swaClient from 'serverless-website-analytics-client';

import Home from "./Home.svelte";
import About from "./About.svelte";

const routes = {
  '/': Home,
  '/about': About,
}

swaClient.v1.analyticsPageInit({
  inBrowser: true, //Not SSR
  site: "<Friendly site name>", //vue-project
  apiUrl: "<Your serverless-website-analytics URL>", //https://my-serverless-website-analytics-backend.com
  // debug: true,
});

function routeLoaded(event) {
  swaClient.v1.analyticsPageChange(event.detail.route);
}

export { swaClient };
</script>
```

Tracking:

[_./usage/svelte/svelte-project/src/lib/Counter.svelte_](https://github.com/rehanvdm/serverless-website-analytics-client/blob/master/usage/svelte/svelte-project/src/lib/Counter.svelte)
```sveltehtml
<script lang="ts">
import { swaClient } from '../App.svelte'
//                         (event: string, data?: number, category?: string)
swaClient.v1.analyticsTrack("svelte", count, "test")
}
</script>
````

#### Angular

See example at: https://github.com/cebert/serverless-web-analytics-demo-spa-application

#### PHP

See example at: https://github.com/wheeleruniverse/wheelerrecommends

#### ..Any other framework

## Package src

The src located at `package/src/index.ts` does not use any libraries to generate the API. The TypeScript types however
are generated from the `OpenAPI-Ingest.yaml` file that is copied(manually) from the backend
(`cd src/src && npm run generate-openapi-ingest`). Once the latest `OpenAPI-Ingest.yaml` is copied to the `package/src`
directory the command `cd package && npm run generate-types` can be run to generate the latest TS types.

The client is written in a functional manner and leverages namespaces for the versioning.

The deploy scripts are managed by [wireit](https://github.com/google/wireit) which just supercharges your `npm` scripts.
It calls the certain functions in the `package/src/scripts.ts` file to do things like generate the API TS types from the
OpenAPI spec and package the app from the `/src` to the `/dist` directory.

## Developing

Commits MUST follow the [Conventional Commits](https://gist.github.com/Zekfad/f51cb06ac76e2457f11c80ed705c95a3) standard.
Commit names are used to determine the next logical version number as per [semantic-release](https://github.com/semantic-release/semantic-release).
A small cheat sheet, in order to get a:
- Patch - Have at least 1 commit name with a `fix:` type
- Minor - Have at least 1 commit name with a `feat:` type
- Major - Have at least 1 commit message (in the footer) that includes the words: `BREAKING CHANGE: `

A new Major version should only be rolled when a new version of the backend ingest API is rolled out. The client package
major version must always match the current ingest API latest version.

A GitHub workflow is used to create the new version on GitHub and NPM. It is only triggered on the condition that it
is a push to main (after a PR is merged) and that the `/package` files changed.

## Contributing

All contributions are welcome!

There are currently no test other than manually verifying the code works as expected
by the frameworks as in the Usage section. There is also no style enforced, but I would prefer the following for the
time being:
- 2 spaces
- Semicolons on line-endings
- Braces on new lines for functions, types can be inline.

I know barbaric 😅. Tests, linting, prettier and pre commit hooks still need to be added and then the style
mention above can be forgo.

## FAQ

### The network calls to the backend fail with 403

This is because the `Origin` that is sending the request has not been added to the `ALLOWED_ORIGINS` config.

Examples of Origins:
- If you are doing local development then your origin might look like `http://localhost:5173`
- If it from your personal blog then it might look like `https://rehanvdm.com` but don't forget to also whitelist all
possible subdomains as well like: `https://www.rehanvdm.com`.

If this value is currently set to allow all Origins (not recommended) with a `*` then the 403 is caused by something
else and not the `Origin` whitelisting.

### Why not fetch with `keepalive` in the client

The `navigator.sendBeacon(...)` has type `ping` in Chrome or `beacon` in FireFox instead of `POST`, it also does
not send preflight `OPTION` calls even if it is not the same host. Browsers just handle it slightly differently
and the probability of it being delivered is greater than fetch with `keepalive` set.
More on the [topic](https://medium.com/fiverr-engineering/benefits-of-sending-analytical-information-with-sendbeacon-a959cb206a7a).
