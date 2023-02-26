import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as swaClient from '../../../../package/dist/index';
// import * as swaClient from 'serverless-website-analytics-client';

import './assets/main.css'

const app = createApp(App)

app.use(router)

// const apiUrl = "http://localhost:3000";
const inBrowser = true; //Not SSR
const apiUrl = "https://d3nhr87nci4rd5.cloudfront.net";
const siteName = "vue-project";
const debug = false;

swaClient.v1.analyticsPageInit(inBrowser, siteName, apiUrl, debug);
router.afterEach((event) => {
  swaClient.v1.analyticsPageChange(event.path);
});

app.mount('#app')
