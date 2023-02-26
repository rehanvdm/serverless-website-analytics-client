# Serverless Website Analytics Client

## Usage

### Install

```
npm install serverless-website-analytics-client
```

### Vue

Initialize and

```typescript
import * as swaClient from 'serverless-website-analytics-client'

const inBrowser = true; //Not SSR
const apiUrl = "https://d3nhr87nci4rd5.cloudfront.net";
const siteName = "vue-project";
const debug = false;
swaClient.v1.analyticsPageInit(inBrowser, siteName, apiUrl, debug);
router.afterEach((event) => {
  swaClient.v1.analyticsPageChange(event.path);
});

```


## Package src



## Why not fetch with `keepalive` in the client

The `navigator.sendBeacon(...)` has type `ping` instead of `POST`, it also does not send preflight `OPTION` calls if it
is not the same host. Browsers just handle it slightly differently and the probability of it being delivered is greater
than fetch with keepalive set. More on the [topic](https://medium.com/fiverr-engineering/benefits-of-sending-analytical-information-with-sendbeacon-a959cb206a7a).
