/**
 * Gets proxy configuration for test environments.
 * @returns Proxy configuration object or undefined if no proxy is configured
 */
export function getProxyConfig():
  | {
      server: string;
      bypass?: string;
      username?: string;
      password?: string;
    }
  | undefined {
  const proxyUrl = process.env.TEST_PROXY_URL;
  if (!proxyUrl) return undefined;

  return {
    server: proxyUrl,
    bypass: "localhost,127.0.0.1,.local",
    username: process.env.TEST_PROXY_USERNAME,
    password: process.env.TEST_PROXY_PASSWORD,
  };
}
