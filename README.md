# Serverless Website Analytics Client

`/package` - Contains the NPM package code as published on [npm](https://www.npmjs.com/package/serverless-website-analytics-client)
and installed by clients.
`/usage` - Contains the basic `create` app for: Vue, React and Svelte that showcase how to use the client in each of
those frameworks. This is also highlighted in the next Usage section.

## Usage

Install the client:
```
npm install serverless-website-analytics-client
```

Irrelevant of the framework, you have to do the following to track page views on your site:

1. Initialize the client only once with `analyticsPageInit`. The site name must correspond with one that you specified
when deploying the `serverless-website-analytics` backend. You also need the URL to the backend. Make sure your frontend
site's `Origin` is whitelisted in the backend config.
2. On each route change call the `analyticsPageChange` function with the name of the new page.

The following sections show you how to do it in various frameworks.

### Vue

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
```

### React

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
```

### Svelte

TODO

## Package src

The src located at `package/src/index.ts` does not use any libraries to generate the API. The TypeScript types however
are generated from the `OpenAPI-Ingest.yaml` file that is copied(manually) from the backend. The client is written in a
functional manner and leverages namespaces for the versioning.

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
