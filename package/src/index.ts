import { nanoid } from "nanoid";
import * as ApiTypes from "./ingest-api-types";

export namespace v1
{
  const storagePrefix = "swa-";
  const STORAGE_KEYS = {
    LOCAL: {
      USER_ID: storagePrefix+"userId",
    },
  };

  const pathTrackPage = "/api-ingest/v1/page/view";
  const pathTrackEvent = "/api-ingest/v1/event/track";

  /* === SESSION STORAGE === */
  let sessionId: string | undefined = undefined;
  let userId: string | undefined = undefined;
  let currentPageAnalytic: ApiTypes.V1.MutationPageView.RequestBody | undefined;
  let pageTimeIncrementStarted: boolean = false;
  let visibilityListening: boolean = false;

  let global: {
    inBrowser: boolean,
    site: string,
    apiUrl: string,
    debug: boolean,
  } = {
    inBrowser: false,
    site: "",
    apiUrl: "",
    debug: false
  };
  /* ======================= */

  function sendRequest(urlAndPath: string, jsonDataStringified: string)
  {
    navigator.sendBeacon(urlAndPath, jsonDataStringified);
    // fetch(urlAndPath, {
    //   keepalive: true, // Same as navigator.sendBeacon(..) then
    //   method: 'POST',
    //   headers: {
    //     'content-type': 'application/json',
    //   },
    //   body: jsonDataStringified,
    // });
  }


  type InitOptions = {
    /**
     * If SSR set this to false
     */
    inBrowser: boolean,

    /**
     * The site name to send analytics as
     */
    site: string,

    /**
     * The API URL
     */
    apiUrl: string,

    /**
     * Prints debug messages if enabled
     */
    debug?: boolean
  }

  /**
   * Init the client only once
   * @param initOptions
   */
  export function analyticsPageInit(initOptions: InitOptions)
  {
    global = {
      inBrowser: initOptions.inBrowser,
      site: initOptions.site,
      apiUrl: initOptions.apiUrl,
      debug: !!initOptions.debug
    };

    if(!global.inBrowser)
      return;

    if(!sessionId)
      sessionId = nanoid();
    else
      throw new Error("Analytics has already been initialized, `analyticsPageInit` must only be called once");

    userId = localStorage.getItem(STORAGE_KEYS.LOCAL.USER_ID) || undefined;
    if(!userId)
    {
      userId = nanoid();
      localStorage.setItem(STORAGE_KEYS.LOCAL.USER_ID, userId);
    }

    /* Timer that starts once and will get the current analytic page object and increment the time only if the page is visible */
    if(!pageTimeIncrementStarted)
    {
      global.debug && console.log("pageTimeIncrementStarted");
      pageTimeIncrementStarted = true;

      setInterval(() =>
      {
        if (document.visibilityState === 'visible')
        {
          if(currentPageAnalytic)
            currentPageAnalytic.time_on_page++;

          global.debug && currentPageAnalytic && console.log(currentPageAnalytic.page_url, currentPageAnalytic.time_on_page);
        }
      }, 1000)
    }

    /* Send the analytic current objet as soon as the page is not visible anymore, so above sends between page changes
     * and this covers the case for the last page navigation that won't trigger the watch event  */
    if(!visibilityListening)
    {
      visibilityListening = true;
      //Ehh.. This seems to fire/be hidden on the first load, so sends current analytic then, but not that bad, not gonna spend time to fix now
      document.addEventListener('visibilitychange', () =>
      {
        if(document.visibilityState === 'visible')
        {
          global.debug && console.log("VISIBLE", new Date());
        }
        if(document.visibilityState === 'hidden')
        {
          global.debug && console.log("HIDDEN", new Date());
          if(currentPageAnalytic)
            sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));
        }
      });
    }
  }

  function getCleanQueryString(queryStringParams: { [p: string]: string }) {
    const removeFromParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const remainderQs = [];
    for (let key of Object.keys(queryStringParams)) {
      if (removeFromParams.includes(key))
        continue;

      remainderQs.push(key + "=" + queryStringParams[key]);
    }
    if (remainderQs.length == 0)
      return undefined;

    return remainderQs.join(",");
  }

  /**
   * Call on every page change
   * @param path The new page path
   */
  export function analyticsPageChange(path: string)
  {
    if(!global.inBrowser)
      return;

    if(!sessionId || !userId)
      throw new Error("Analytics have not been initialized");

    /* If we have an existing page analytic send it (because we incremented the time on page for it), before creating the new one */
    if(currentPageAnalytic)
    {
      global.debug && console.log("Sending previous analytic");
      sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));
    }

    const pageId = nanoid();
    const openedAt =  (new Date()).toISOString();

    /* Get querystring params */
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    currentPageAnalytic = {
      site: global.site,
      user_id: userId,
      session_id: sessionId,
      page_id: pageId,
      page_url: path,
      page_opened_at: openedAt,
      time_on_page: 0,
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_term: params.utm_term,
      utm_content: params.utm_content,
      referrer: document.referrer,
      querystring: getCleanQueryString(params)
    };



    global.debug && console.log("Sending new analytic");
    sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));
  }


  /**
   * Call on every event you want to track, like button clicks etc
   * @param inBrowser
   * @param event The event name
   * @param data If omitted, defaults to 1
   * @param category Optional
   */
  export function analyticsTrack(event: string, data?: number, category?: string)
  {
    if(!global.inBrowser)
      return;

    if(!sessionId || !userId)
      throw new Error("Analytics have not been initialized");

    const trackedAt =  (new Date()).toISOString();

    /* Get querystring params */
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const trackedEvent: ApiTypes.V1.MutationEventTrack.RequestBody = {
      site: global.site,
      user_id: userId!,
      session_id: sessionId!,
      category: category,
      event: event,
      data: data,
      tracked_at: trackedAt,
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_term: params.utm_term,
      utm_content: params.utm_content,
      referrer: document.referrer,
      querystring: getCleanQueryString(params)
    };

    sendRequest(global.apiUrl+pathTrackEvent, JSON.stringify(trackedEvent));
  }

}
