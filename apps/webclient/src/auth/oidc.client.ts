import { discovery, Configuration } from 'openid-client';

let configuration: Configuration | null = null;

export async function getOidcConfiguration(): Promise<Configuration> {
  if (configuration) {
    return configuration;
  }

  const issuerUrl = process.env['BALLWARE_IDENTITYURL'];
  const clientId = process.env['BALLWARE_CLIENTID'];
  const clientSecret = process.env['BALLWARE_CLIENTSECRET'] ?? undefined;

  if (!issuerUrl || !clientId) {
    throw new Error('BALLWARE_IDENTITYURL or BALLWARE_CLIENTID not set');
  }

  configuration = await discovery(new URL(issuerUrl), clientId, clientSecret);

  return configuration;
}
