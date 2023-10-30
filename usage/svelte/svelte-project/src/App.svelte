<!-- Show the router -->
<Router {routes}  on:routeLoaded={routeLoaded} />

<script context="module">
  import Router from 'svelte-spa-router'
  import * as swaClient from 'serverless-website-analytics-client';
  // import * as swaClient from '../../../../package/src/index.ts';

  import Home from "./Home.svelte";
  import About from "./About.svelte";

  const routes = {
    '/': Home,
    '/about': About,
  }

  swaClient.v1.analyticsPageInit({
    inBrowser: true,
    site: "tests",
    apiUrl: "http://localhost:3000",
    // apiUrl: "https://d3nhr87nci4rd5.cloudfront.net",
    // debug: true,
  });

  function routeLoaded(event) {
    // console.log('Route', event.detail.route)
    swaClient.v1.analyticsPageChange(event.detail.route);
  }

  export { swaClient };
</script>
