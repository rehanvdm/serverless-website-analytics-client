import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import * as swaClient from '../../../../package/dist/index';
// import * as swaClient from '../../../../package/src';
import * as swaClient from 'serverless-website-analytics-client';

import './assets/main.css'

const app = createApp(App);
app.use(router);

swaClient.v1.analyticsPageInit({
  inBrowser: true,
  site: "vue-project",
  // apiUrl: "http://localhost:3000",
  apiUrl: "https://d3nhr87nci4rd5.cloudfront.net",
  // debug: true,
});
router.afterEach((event) => {
  swaClient.v1.analyticsPageChange(event.path);
});

app.mount('#app');
