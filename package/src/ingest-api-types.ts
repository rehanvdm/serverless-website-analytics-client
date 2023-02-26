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

export interface MutationV1PageTrackPayload {
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
}

export namespace V1 {
  /**
 * No description
 * @name MutationV1PageTrack
 * @request POST:/v1/page/track
 * @response `200` `any` Successful response
 * @response `default` `{
    message: string,
    code: string,
    issues?: ({
    message: string,

})[],

}`
*/
  export namespace MutationV1PageTrack {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MutationV1PageTrackPayload;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}
