import qs from 'qs';
import { isEmpty, isNil, reject } from 'ramda';
import { AxiosInstance, AxiosResponse, Method } from 'axios';
import { ShortUrlsListParams } from '../../short-urls/reducers/shortUrlsListParams';
import { ShortUrl, ShortUrlData } from '../../short-urls/data';
import { OptionalString } from '../utils';
import {
  ShlinkHealth,
  ShlinkMercureInfo,
  ShlinkShortUrlsResponse,
  ShlinkTags,
  ShlinkTagsResponse,
  ShlinkVisits,
  ShlinkVisitsParams,
  ShlinkShortUrlMeta,
  ShlinkDomain,
  ShlinkDomainsResponse,
} from './types';

const buildShlinkBaseUrl = (url: string, apiVersion: number) => url ? `${url}/rest/v${apiVersion}` : '';
const rejectNilProps = reject(isNil);

export default class ShlinkApiClient {
  private apiVersion: number;

  public constructor(
    private readonly axios: AxiosInstance,
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {
    this.apiVersion = 2;
  }

  public readonly listShortUrls = async (params: ShortUrlsListParams = {}): Promise<ShlinkShortUrlsResponse> =>
    this.performRequest<{ shortUrls: ShlinkShortUrlsResponse }>('/short-urls', 'GET', params)
      .then(({ data }) => data.shortUrls);

  public readonly createShortUrl = async (options: ShortUrlData): Promise<ShortUrl> => {
    const filteredOptions = reject((value) => isEmpty(value) || isNil(value), options as any);

    return this.performRequest<ShortUrl>('/short-urls', 'POST', {}, filteredOptions)
      .then((resp) => resp.data);
  };

  public readonly getShortUrlVisits = async (shortCode: string, query?: ShlinkVisitsParams): Promise<ShlinkVisits> =>
    this.performRequest<{ visits: ShlinkVisits }>(`/short-urls/${shortCode}/visits`, 'GET', query)
      .then(({ data }) => data.visits);

  public readonly getTagVisits = async (tag: string, query?: Omit<ShlinkVisitsParams, 'domain'>): Promise<ShlinkVisits> =>
    this.performRequest<{ visits: ShlinkVisits }>(`/tags/${tag}/visits`, 'GET', query)
      .then(({ data }) => data.visits);

  public readonly getShortUrl = async (shortCode: string, domain?: OptionalString): Promise<ShortUrl> =>
    this.performRequest<ShortUrl>(`/short-urls/${shortCode}`, 'GET', { domain })
      .then(({ data }) => data);

  public readonly deleteShortUrl = async (shortCode: string, domain?: OptionalString): Promise<void> =>
    this.performRequest(`/short-urls/${shortCode}`, 'DELETE', { domain })
      .then(() => {});

  public readonly updateShortUrlTags = async (
    shortCode: string,
    domain: OptionalString,
    tags: string[],
  ): Promise<string[]> =>
    this.performRequest<{ tags: string[] }>(`/short-urls/${shortCode}/tags`, 'PUT', { domain }, { tags })
      .then(({ data }) => data.tags);

  public readonly updateShortUrlMeta = async (
    shortCode: string,
    domain: OptionalString,
    meta: ShlinkShortUrlMeta,
  ): Promise<ShlinkShortUrlMeta> =>
    this.performRequest(`/short-urls/${shortCode}`, 'PATCH', { domain }, meta)
      .then(() => meta);

  public readonly listTags = async (): Promise<ShlinkTags> =>
    this.performRequest<{ tags: ShlinkTagsResponse }>('/tags', 'GET', { withStats: 'true' })
      .then((resp) => resp.data.tags)
      .then(({ data, stats }) => ({ tags: data, stats }));

  public readonly deleteTags = async (tags: string[]): Promise<{ tags: string[] }> =>
    this.performRequest('/tags', 'DELETE', { tags })
      .then(() => ({ tags }));

  public readonly editTag = async (oldName: string, newName: string): Promise<{ oldName: string; newName: string }> =>
    this.performRequest('/tags', 'PUT', {}, { oldName, newName })
      .then(() => ({ oldName, newName }));

  public readonly health = async (): Promise<ShlinkHealth> =>
    this.performRequest<ShlinkHealth>('/health', 'GET')
      .then((resp) => resp.data);

  public readonly mercureInfo = async (): Promise<ShlinkMercureInfo> =>
    this.performRequest<ShlinkMercureInfo>('/mercure-info', 'GET')
      .then((resp) => resp.data);

  public readonly listDomains = async (): Promise<ShlinkDomain[]> =>
    this.performRequest<{ domains: ShlinkDomainsResponse }>('/domains', 'GET').then(({ data }) => data.domains.data);

  private readonly performRequest = async <T>(url: string, method: Method = 'GET', query = {}, body = {}): Promise<AxiosResponse<T>> => {
    try {
      return await this.axios({
        method,
        url: `${buildShlinkBaseUrl(this.baseUrl, this.apiVersion)}${url}`,
        headers: { 'X-Api-Key': this.apiKey },
        params: rejectNilProps(query),
        data: body,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
      });
    } catch (e) {
      const { response } = e;

      // Due to a bug on all previous Shlink versions, requests to non-matching URLs will always result on a CORS error
      // when performed from the browser (due to the preflight request not returning a 2xx status.
      // See https://github.com/shlinkio/shlink/issues/614), which will make the "response" prop not to be set here.
      // The bug will be fixed on upcoming Shlink patches, but for other versions, we can consider this situation as
      // if a request has been performed to a not supported API version.
      const apiVersionIsNotSupported = !response;

      // When the request is not invalid or we have already tried both API versions, throw the error and let the
      // caller handle it
      if (!apiVersionIsNotSupported || this.apiVersion === 1) {
        throw e;
      }

      this.apiVersion = this.apiVersion - 1;

      return await this.performRequest(url, method, query, body);
    }
  };
}
