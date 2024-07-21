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

  /* Track all `button` and `a` HTML elements that have the `swa-event` attribute if `attr-tracking` is specified on the script
  *  Example:
  *  <button swa-event="download">Download</button>
  *  <button swa-event="download" swa-event-category="clicks">Download</button>
  *  <button swa-event="buy" swa-event-category="clicks" swa-event-data="99">Buy now</button>
  *  <a swa-event="click" swa-event-category="link" swa-event-data="2">Click me</a>
  *  */
  const attrTracking = me.getAttribute('attr-tracking');
  if(attrTracking && attrTracking != "false") {
    document.querySelectorAll('button, a').forEach(function(element) {
      element.addEventListener('click', (event) => {
        if(!event.currentTarget)
          return;

        const eventTarget = event.currentTarget as HTMLElement;
        const trackEvent = eventTarget.getAttribute('swa-event');
        if(trackEvent) {
          const trackCategory = eventTarget.getAttribute('swa-event-category') || undefined;
          const trackData = eventTarget.getAttribute('swa-event-data') || undefined;
          const trackDataNumber = trackData ? Number(trackData) : undefined;
          const asyncAttr = eventTarget.getAttribute('swa-event-async');
          const isAsync = (asyncAttr !== null && asyncAttr.toLowerCase() !== "false") || false;

          // Have to use on the window object because the local defined swaClient is out of scope, it seems.
          //@ts-ignore
          const globalSwaClient = window.swa as typeof swaClient;
          globalSwaClient.v1.analyticsTrack(trackEvent, trackDataNumber, trackCategory, isAsync);
        }
      });
    });
  }


})();

