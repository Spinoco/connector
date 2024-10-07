/**
 * Desribes coordinates of arbitrary http server
 */
export interface HttpServer {
  /** Name of the host (FQDN or IP) **/
  hostname: string;

  /** Port where to contact server. If leaved empty 80 or 443 will be used based on the value of teh secure parameter **/
  port?: number;

  /**Ttrue, if the server shall use https instead of http **/
  secure: boolean;
}
