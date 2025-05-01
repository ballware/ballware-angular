import { QueryParams } from "@ballware/meta-model";

/**
 * Convert param object to additional url parameter
 * @param params Object containing url parameter
 * @returns Url encoded string containing parameter
 */
 export function additionalParamsToUrl(params: QueryParams, firstPrefix = '&') {
  let result = '';

  if (params) {
    Object.keys(params).forEach(k => {
      const val = params[k];

      if (val instanceof Array) {
        val.forEach(
          v => (result += `${result !== '' ? '&' : firstPrefix}${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        );
      } else {
        result += `${result !== '' ? '&' : firstPrefix}${encodeURIComponent(k)}=${encodeURIComponent(val as string|number|boolean)}`;
      }
    });
  }

  return result;
}
