import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as swaClient from '../../../../package/dist'


import './assets/main.css'

const app = createApp(App)

app.use(router)

// const apiUrl = "http://localhost:3000";
const apiUrl = "https://d3nhr87nci4rd5.cloudfront.net";
swaClient.v1.analyticsPageInit(true, "vue-project", apiUrl, true);
router.afterEach((event) =>
{
  swaClient.v1.analyticsPageChange(event.path);
})

app.mount('#app')
