import * as swaClient from "../";

(() => {
  /* Only specify the data tag serverless-website-analytics if the browser does not support `document.currentScript`
  * All modern browsers since 2015 do  */
  const me = document.currentScript || document.querySelector('script[serverless-website-analytics]');
  if(!me)
    throw new Error("Could not find script tag with attribute 'serverless-website-analytics' on the script tag.");

  const site = me.getAttribute('site');
  if(!site)
    throw new Error("Could not find attribute 'site' on the script tag.");

  /* The API URL to send the metrics to will 99% be the same as where the standalone script is loaded from, only use
  * the `api-url` if specified explicitly. */
  let scriptOrigin = "";
  try {
    //@ts-ignore
    scriptOrigin = new URL(me.src).origin;
  } catch (e) {
    console.error("Could not parse URL from script tag", e);
  }
  let apiUrl = me.getAttribute('api-url');
  if(!scriptOrigin && !apiUrl)
    throw new Error("Could not auto-detect script origin, specify the 'api-url' attribute on the script tag.");
  if(!apiUrl)
    apiUrl = scriptOrigin;

  const routing = me.getAttribute('routing')
  if(routing && (routing !== "path" && routing !== "hash"))
    throw new Error("Attribute 'routing' must be either 'path' or 'hash'");

  function getPath() {
    if(routing === "path")
      return window.location.pathname;
    else if(routing === "hash")
      return window.location.hash ? window.location.hash : "/";
    else
      return window.location.pathname + (window.location.hash ? "#" + window.location.hash : "");
  }

  //@ts-ignore
  window.swa = swaClient;
  swaClient.v1.analyticsPageInit({
    inBrowser: true,
    site: site,
    apiUrl: apiUrl,
    // debug: true,
  });

  let currentPage = location.href;
  setInterval(function() {
    if (currentPage != location.href) {
      currentPage = location.href;
      // console.log('New URL:', getPath());
      swaClient.v1.analyticsPageChange(getPath());
    }
  }, 500);

  swaClient.v1.analyticsPageChange(getPath());

})();

