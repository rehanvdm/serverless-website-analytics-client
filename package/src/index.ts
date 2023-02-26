import { nanoid } from "nanoid";
import * as ApiTypes from "./ingest-api-types";

export namespace v1
{
  const storagePrefix = "swa-";
  const STORAGE_KEYS = {
    LOCAL: {
      USER_ID: storagePrefix+"userId",
    },
    SESSION: {
      CURRENT_PAGE_ANALYTIC: storagePrefix+"currentPageAnalytic",
      PAGE_TIME_INCREMENT_STARTED: storagePrefix+"pageTimeIncrementStarted",
    }
  };

  const pathTrackPage = "/api-ingest/v1/page/track";

  /* === SESSION STORAGE === */
  let sessionId: string | undefined = undefined;
  let userId: string | undefined = undefined;
  let currentPageAnalytic: ApiTypes.V1.MutationV1PageTrack.RequestBody | undefined;
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

  /**
   * Init the client only once
   * @param inBrowser If SSR set this to false
   * @param site The site name to send analytics as
   * @param apiUrl The API URL
   * @param debug Prints debug messages if enabled
   */
  export function analyticsPageInit(inBrowser: boolean, site: string, apiUrl: string, debug: boolean = false)
  {
    global = {
      inBrowser,
      site,
      apiUrl,
      debug
    };

    if(!global.inBrowser)
      return;

    if(!sessionId)
      sessionId = nanoid();

    userId = localStorage.getItem(STORAGE_KEYS.LOCAL.USER_ID) || undefined;
    if(!userId)
    {
      userId = nanoid();
      localStorage.setItem(STORAGE_KEYS.LOCAL.USER_ID, userId);
    }

    /* Timer that starts once and will get the current analytic page object and increment the time only if the page is visible */
    if(!pageTimeIncrementStarted)
    {
      debug && console.log("pageTimeIncrementStarted");
      pageTimeIncrementStarted = true;

      setInterval(() =>
      {
        if (document.visibilityState === 'visible')
        {
          if(currentPageAnalytic)
            currentPageAnalytic.time_on_page++;

          debug && currentPageAnalytic &&  console.log(currentPageAnalytic.page_url, currentPageAnalytic.time_on_page);
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
          debug && console.log("VISIBLE", new Date());
        }
        if(document.visibilityState === 'hidden')
        {
          debug && console.log("HIDDEN", new Date());
          if(currentPageAnalytic)
            sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));
        }
      });
    }
  }

  /**
   * Call on every page change
   * @param path The new page path
   */
  export function analyticsPageChange(path: string)
  {
    console.log(global)
    if(!global.inBrowser)
      return;

    if(!sessionId || !userId)
      throw new Error("Analytics have not been initialized");

    /* If we have an existing page analytic send it(because we incremented the time on page for it), before creating the new one */
    if(currentPageAnalytic)
      sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));

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
    };

    const removeFromParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const remainderQs = [];
    for(let key of Object.keys(params))
    {
      if(removeFromParams.includes(key))
        continue;

      remainderQs.push(key+"="+params[key]);
    }
    if(remainderQs.length > 0)
      currentPageAnalytic.querystring = remainderQs.join(",");

    sendRequest(global.apiUrl+pathTrackPage, JSON.stringify(currentPageAnalytic));
  }


  // /**
  //  *
  //  * @param inBrowser
  //  * @param event
  //  * @param data If omitted, defaults to 1
  //  */
  // export function analyticsTrack(event: string, data?: number)
  // {
  //   if(!global.inBrowser)
  //     return;
  //
  //   const trackedAt =  (new Date()).toISOString();
  //
  //   const trackedEvent: ReqAnalyticsTrackGoal = {
  //     site: global.site,
  //     user_id: userId!,
  //     event: event,
  //     data: data,
  //     tracked_at: trackedAt,
  //   };
  //
  //   navigator.sendBeacon(global.apiUrl+'/v1/analytics/track_goal', JSON.stringify(trackedEvent));
  // }

}
