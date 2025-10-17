// Temporarily disabled for AWS static export
export const logger = {
  info: (message: string, meta?: any) => console.log(message, meta),
  error: (message: string, meta?: any) => console.error(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  debug: (message: string, meta?: any) => console.debug(message, meta),
};