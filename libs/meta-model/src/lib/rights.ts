/**
 * Definition for extended rights check function for custom script right checks
 *
 * @param userinfo Container with current user rights
 * @param application Requested business object application scope
 * @param entity Requested business object type
 * @param readOnly Object container in explicit readonly mode
 * @param right Requested right
 * @param param Extra param for custom rights check
 * @param result Rights check result from default function
 * @returns true if access is allowed, false if not
 */
 export type EntityRightsCheckFunc = (
  userinfo: Record<string, unknown>,
  application: string,
  entity: string,
  readOnly: boolean,
  right: string,
  param: Record<string, unknown> | undefined,
  result: boolean
) => boolean;

/**
 * Custom script for access rights check of tenant
 * @param userinfo Assigned user rights
 * @param right Requested right
 * @returns true if access allowed, false if access denied
 */
export type TenantRightsCheckFunc = (userinfo: Record<string, unknown>, right: string) => boolean;
