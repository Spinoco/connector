import pino, {BaseLogger} from "pino";


export interface SpinocoLogger {

  trace(message: string, object?: any): void

  debug(message: string, object?: any): void

  info(message: string, object?: any): void

  warn(message: string, object?: any): void

  error(message: string, object?: any): void

}

function buildRootLogger(): SpinocoLogger {
  const pinoLogger: BaseLogger = pino({
    level :  (process.env.SP_LOG_LEVEL || "info").toLowerCase(),
    redact: [
      "api.token" // prevent token to show in the logs
    ]
  })

  return new class implements SpinocoLogger {
    debug(message: string, object?: any): void {
      pinoLogger.debug(object, message)
    }

    error(message: string, object?: any): void {
      pinoLogger.error(object, message)
    }

    info(message: string, object?: any): void {
      pinoLogger.info(object, message)
    }

    trace(message: string, object?: any): void {
      pinoLogger.trace(object, message)
    }

    warn(message: string, object?: any): void {
      pinoLogger.warn(object, message)
    }
  }
}


export const Logger: SpinocoLogger = buildRootLogger();

