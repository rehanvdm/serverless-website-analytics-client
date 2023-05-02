/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface MutationPageViewPayload {
  site: string;
  user_id: string;
  session_id: string;
  page_id: string;
  page_url: string;
  page_opened_at: string;
  time_on_page: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  querystring?: string;
  referrer?: string;
}

export interface MutationEventTrackPayload {
  site: string;
  user_id: string;
  session_id: string;
  event: string;
  tracked_at: string;
  data?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  querystring?: string;
  referrer?: string;
}

export namespace V1 {
  /**
 * No description
 * @name MutationPageView
 * @request POST:/v1/page/view
 * @response `200` `any` Successful response
 * @response `default` `{
    message: string,
    code: string,
    issues?: ({
    message: string,

})[],

}`
*/
  export namespace MutationPageView {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MutationPageViewPayload;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  } /**
 * No description
 * @name MutationEventTrack
 * @request POST:/v1/event/track
 * @response `200` `any` Successful response
 * @response `default` `{
    message: string,
    code: string,
    issues?: ({
    message: string,

})[],

}`
*/
  export namespace MutationEventTrack {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MutationEventTrackPayload;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}
