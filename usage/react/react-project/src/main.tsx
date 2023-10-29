import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import About from './About.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import * as swaClient from 'serverless-website-analytics-client';
// import * as swaClient from '../../../../package/src/index.ts';

const router = createBrowserRouter([{
    path: "/",
    element: <App></App>
  }, {
    path: "/about",
    element: <About></About>
  },
]);

swaClient.v1.analyticsPageInit({
  inBrowser: true,
  site: "tests",
  apiUrl: "http://localhost:3000",
  // apiUrl: "https://d3nhr87nci4rd5.cloudfront.net",
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
