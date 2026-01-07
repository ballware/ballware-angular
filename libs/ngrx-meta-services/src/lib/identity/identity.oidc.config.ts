export interface OidcIdentityConfig {
  issuer: string;
  client: string;
  scopes: string;
  tenantClaim: string;
  usernameClaim: string;
  profileUrl: string;
  accessTokenAutoRefresh: boolean;
}
