/**
 * Desribes the coordinates of an arbitrary HTTP server
 */
export interface HttpServer {
  /** Name of the host (FQDN or IP) **/
  hostname: string;

  /** The port at which the server should be contacted. If left empty, 80 or 443 will be used, based on the value of the secure parameter **/
  port?: number;

  /** True, if the server should use HTTPS instead of HTTP **/
  secure: boolean;
}
