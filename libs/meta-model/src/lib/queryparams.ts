/**
 * Generic data container type containing parameter values for data queries
 */
 export type QueryParams = Record<
 string,
 string | number | boolean | Array<string | number | boolean> | unknown
>;
