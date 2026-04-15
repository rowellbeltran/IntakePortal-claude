import { UiPath } from '@uipath/uipath-typescript';

/**
 * Environment variable configuration for the UiPath SDK.
 * Set these in .env (locally) or they are injected by the uip codedapp tool at runtime.
 */
export const ENV = {
  baseUrl:    import.meta.env.VITE_UIPATH_BASE_URL    ?? 'https://api.uipath.com',
  orgName:    import.meta.env.VITE_UIPATH_ORG_NAME    ?? '',
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME ?? '',
  clientId:   import.meta.env.VITE_UIPATH_CLIENT_ID   ?? '',
  scope:      import.meta.env.VITE_UIPATH_SCOPE       ?? 'OR.Tasks OR.Tasks.Write',
  /** Folder ID (number) for Action Center task operations. Required for task create/getAll. */
  folderId:   parseInt(import.meta.env.VITE_UIPATH_FOLDER_ID ?? '0', 10) || 0,
};

/**
 * True when all required OAuth fields are present in env vars.
 * When false, the app runs in Demo Mode with static sample data.
 */
export const isConfigured = !!(ENV.clientId && ENV.orgName && ENV.tenantName);

/**
 * UiPath SDK singleton. Null in Demo Mode (env vars not configured).
 * Call sdk.initialize() once to start the OAuth PKCE flow.
 */
export const sdk = isConfigured
  ? new UiPath({
      baseUrl:     ENV.baseUrl,
      orgName:     ENV.orgName,
      tenantName:  ENV.tenantName,
      clientId:    ENV.clientId,
      scope:       ENV.scope,
      redirectUri: `${window.location.origin}${window.location.pathname}`,
    })
  : null;
